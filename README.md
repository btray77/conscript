### `README.md`

````md
# Conscript

Conscript is a lightweight CLI tool that concatenates a directory of text files into a single output file while respecting `.gitignore` and optional `.bundlerrc` configurations. It’s perfect for quickly generating project snapshots, file listings, or combined source code files.

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

---

## ✨ Features

- **Respects `.gitignore` and `.bundlerrc`** to skip unwanted files.
- **Binary detection** to automatically skip non-text files.
- **Deterministic output** sorted by file path.
- **Two modes**:
  - `default` — concatenate file contents with headers.
  - `list` — output only the file paths.
- **Zero install** — run instantly via `npx`.

---

## 🚀 Quick Start

Run directly without installing:

```bash
npx github:<your-user>/<your-repo>@v1.0.0 conscript -d ./src -o project-files.txt
````

This will scan `./src`, skip ignored/binary files, and produce `project-files.txt`.

---

## ⚙️ Options

| Flag                  | Description               | Default            |
| --------------------- | ------------------------- | ------------------ |
| `-d, --dir <path>`    | Input directory to scan   | `.` (current dir)  |
| `-o, --output <file>` | Output file name          | `concatenated.txt` |
| `-v, --verbose`       | Verbose logging           | off                |
| `-q, --quiet`         | Suppress non-error output | off                |
| `-V, --version`       | Show version number       |                    |
| `-h, --help`          | Show help message         |                    |

---

## 📁 Optional Configuration (`.bundlerrc`)

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

* `additionalIgnores`: Extra ignore patterns.
* `binaryDetection`: Skip binary files automatically.
* `outputFormat`: `"default"` for file contents, `"list"` for file list only.

---

## 📝 Examples

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

## 🪪 License

This project is licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.

You’re free to:

* **Share** — copy and redistribute the material in any medium or format.
* **Adapt** — remix, transform, and build upon the material for any purpose, even commercially.

Under the following terms:

* **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.

Full license text: [CC BY 4.0 Legal Code](https://creativecommons.org/licenses/by/4.0/legalcode)

---

## 🤝 Contributing

Pull requests and suggestions are welcome! Please open an issue before making major changes to discuss what you’d like to change.

---

```
