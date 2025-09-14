# conscript

Conscript is a lightweight CLI that concatenates a directory of text files into a single output file while respecting `.gitignore` and optional `.bundlerrc`. It is great for generating project snapshots, file listings, or combined source code files.

[![Repo](https://img.shields.io/badge/GitHub-btray77%2Fconscript-black)](https://github.com/btray77/conscript)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

---

## Features

- Respects `.gitignore` and `.bundlerrc`
- Binary detection to skip non text files
- Deterministic output sorted by path
- Two modes:
  - `default` concatenate file contents with headers
  - `list` output only file paths
- Zero install run via `npx`

---

## Quick start

Run directly without installing:

```bash
npx github:btray77/conscript@v1.0.0 conscript -d ./src -o project-files.txt
```

This scans `./src`, skips ignored or binary files, and writes `project-files.txt`.

---

## Options

| Flag | Description | Default |
| --- | --- | --- |
| `-d, --dir <path>` | Input directory to scan | `.` |
| `-o, --output <file>` | Output file name | `concatenated.txt` |
| `-v, --verbose` | Verbose logging | off |
| `-q, --quiet` | Suppress non error output | off |
| `-V, --version` | Show version number |  |
| `-h, --help` | Show help |  |

---

## Optional configuration `.bundlerrc`

Place a `.bundlerrc` file in your input directory to override defaults:

```json
{
  "additionalIgnores": ["*.tmp", "temp/", ".env*"],
  "verbose": false,
  "quiet": false,
  "binaryDetection": true,
  "outputFormat": "default"
}
```

- `additionalIgnores` extra ignore patterns
- `binaryDetection` skip binary files automatically
- `outputFormat` `"default"` for contents, `"list"` for file list only

---

## Examples

Concatenate all text files in `./src` into `project-files.txt`:

```bash
npx github:btray77/conscript@v1.0.0 conscript -d ./src -o project-files.txt
```

Create only a list of files (no contents):

```bash
echo '{ "outputFormat": "list" }' > .bundlerrc
npx github:btray77/conscript@v1.0.0 conscript -d ./src -o file-list.txt
```

---

## License

This project is licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0). You may share and adapt the work for any purpose, provided you give appropriate credit.

Full text: https://creativecommons.org/licenses/by/4.0/legalcode

---

## Contributing

Issues and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

_Last updated: 2025-09-14_
