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
