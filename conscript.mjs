#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import os from "node:os";
import igFactory from "ignore";

const VERSION = "1.0.0";

const argv = process.argv.slice(2);
const pick = (flagShort, flagLong, expectsValue = false, def = undefined) => {
  const iShort = argv.indexOf(flagShort);
  const iLong = argv.indexOf(flagLong);
  const i = iShort !== -1 ? iShort : iLong;
  if (i === -1) return def;
  if (!expectsValue) return true;
  const val = argv[i + 1];
  if (!val || val.startsWith("-")) bail(`Missing value for ${flagLong}`);
  return val;
};

if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
  printHelp();
  process.exit(0);
}
if (argv.includes("-V") || argv.includes("--version")) {
  console.log(`Conscript v${VERSION}`);
  process.exit(0);
}

const dir = path.resolve(pick("-d", "--dir", true, "."));
const outFile = path.resolve(pick("-o", "--output", true, "concatenated.txt"));
const verbose = !!pick("-v", "--verbose", false, false);
const quiet = !!pick("-q", "--quiet", false, false);

const defaultConfig = {
  additionalIgnores: ["*.tmp", "temp/", ".env*", "coverage/", "node_modules/"],
  verbose: false,
  quiet: false,
  binaryDetection: true,
  outputFormat: "default"
};

const userRc = await loadBundlerRc(dir);
const cfg = {
  ...defaultConfig,
  ...userRc,
  verbose: verbose ?? defaultConfig.verbose,
  quiet: quiet ?? defaultConfig.quiet
};

if (!cfg.quiet) log(`Conscript v${VERSION}`);
if (!cfg.quiet && userRc) logDim("Loaded .bundlerrc");

ensureInside(dir, process.cwd(), "Input directory must be within current working tree or equal to it.");

const ig = igFactory();
ig.add(["node_modules/", ".git/", ".DS_Store"]);
const gitignorePath = path.join(dir, ".gitignore");
if (await exists(gitignorePath)) {
  try {
    ig.add(await fsp.readFile(gitignorePath, "utf8"));
    if (cfg.verbose && !cfg.quiet) logDim("Applied .gitignore patterns");
  } catch {
    if (!cfg.quiet) warn(".gitignore unreadable, continuing");
  }
}
if (cfg.additionalIgnores?.length) ig.add(cfg.additionalIgnores);

const files = (await listFilesRec(dir))
  .filter(fp => !ig.ignores(path.relative(dir, fp)))
  .filter(fp => path.resolve(fp) !== path.resolve(outFile))
  .sort((a, b) => a.localeCompare(b));

if (!files.length) bail("No files selected after ignore rules.");

const OUT_HEADER = `# Conscript output
# dir: ${relFromCwd(dir)}
# date: ${new Date().toISOString()}
# files: ${files.length}
${"-".repeat(80)}
`;

let written = 0;
const start = Date.now();
await ensureParentDir(outFile);
const outHandle = await fsp.open(outFile, "w");

try {
  await outHandle.writeFile(OUT_HEADER, "utf8");

  if (cfg.outputFormat === "list") {
    for (const f of files) {
      await outHandle.write(`${relFromBase(dir, f)}${os.EOL}`, "utf8");
      written++;
    }
  } else {
    for (const f of files) {
      const rel = relFromBase(dir, f);
      if (cfg.verbose && !cfg.quiet) logDim(`+ ${rel}`);

      if (cfg.binaryDetection && (await isBinaryFast(f))) {
        if (cfg.verbose && !cfg.quiet) warn(`skip binary: ${rel}`);
        continue;
      }

      const header = `${os.EOL}${"=".repeat(80)}${os.EOL}// ${rel}${os.EOL}${"=".repeat(80)}${os.EOL}`;
      await outHandle.write(header, "utf8");
      await pipeFile(f, outHandle);
      await outHandle.write(os.EOL, "utf8");
      written++;
    }
  }
} finally {
  await outHandle.close();
}

const ms = Date.now() - start;
if (!cfg.quiet) log(`Wrote ${written} item${written === 1 ? "" : "s"} to ${relFromCwd(outFile)} in ${ms}ms`);

function printHelp() {
  console.log(`Conscript v${VERSION}
Usage:
  conscript -d <dir> -o <output>

Options:
  -d, --dir <path>       Input directory (default: .)
  -o, --output <file>    Output file (default: concatenated.txt)
  -v, --verbose          Verbose logging
  -q, --quiet            Quiet mode
  -V, --version          Show version
  -h, --help             Show help`);
}

async function loadBundlerRc(baseDir) {
  const p = path.join(baseDir, ".bundlerrc");
  if (!(await exists(p))) return null;
  try {
    const raw = await fsp.readFile(p, "utf8");
    return JSON.parse(raw);
  } catch {
    warn(".bundlerrc parse error, ignoring");
    return null;
  }
}

async function listFilesRec(base) {
  const out = [];
  async function walk(dirPath) {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dirPath, ent.name);
      if (ent.isSymbolicLink()) continue;
      if (ent.isDirectory()) {
        out.push(...await walk(full));
      } else if (ent.isFile()) {
        out.push(full);
      }
    }
    return out;
  }
  return walk(base);
}

async function isBinaryFast(filePath) {
  try {
    const fh = await fsp.open(filePath, "r");
    const buf = Buffer.alloc(8192);
    const { bytesRead } = await fh.read(buf, 0, buf.length, 0);
    await fh.close();
    const slice = buf.subarray(0, bytesRead);
    if (slice.includes(0)) return true;
    let nonText = 0;
    for (let i = 0; i < slice.length; i++) {
      const c = slice[i];
      const printable =
        c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126) || c >= 160;
      if (!printable) nonText++;
    }
    return nonText / Math.max(1, slice.length) > 0.3;
  } catch {
    return false;
  }
}

async function pipeFile(filePath, outHandle) {
  await new Promise((resolve, reject) => {
    const rs = fs.createReadStream(filePath, { encoding: "utf8" });
    rs.on("error", reject);
    rs.on("end", resolve);
    rs.pipe(fs.createWriteStream(null, { fd: outHandle.fd, flags: "a" }), { end: false });
  });
}

function ensureInside(target, root, msg) {
  const t = path.resolve(target);
  const r = path.resolve(root);
  if (t === r) return;
  if (!t.startsWith(r + path.sep)) bail(msg);
}

async function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  await fsp.mkdir(dir, { recursive: true });
}

function relFromBase(base, fp) {
  return path.relative(base, fp) || ".";
}
function relFromCwd(fp) {
  return path.relative(process.cwd(), fp) || ".";
}

async function exists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

function log(s) { console.log(s); }
function logDim(s) { console.log(`\x1b[2m${s}\x1b[0m`); }
function warn(s) { console.warn(`\x1b[33mWarning: ${s}\x1b[0m`); }
function bail(s) { console.error(`\x1b[31mError: ${s}\x1b[0m`); process.exit(1); }
