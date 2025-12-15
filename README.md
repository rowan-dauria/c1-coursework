# c1-coursework

## Building Sphinx Docs Locally

### Prerequisites
Make sure you have a virtual environment activated (optional but recommended).

### Steps

1. Navigate to the docs directory:
`cd <repository path>/docs`
2. Install the documentation dependencies:
`pip install -r requirements.txt`
3. Build the HTML documentation:
`make html`
4. Open the built docs in your browser:
`open _build/html/index.html`
### Useful Commands

| Command | Description |
|---------|-------------|
| `make html` | Build HTML documentation |
| `make clean` | Clear the build cache |
| `make clean html` | Clean and rebuild in one command |
| `sphinx-build -b html . _build/html` | Alternative direct sphinx-build command |

### Notes
- Built documentation is output to `docs/_build/html/`
- The `fivedreg` package must be importable for autodoc to work (installed via `-e ./fiveD_NN_package` in requirements.txt)