# c1-coursework

## Documentation & Package

* [FiveDReg ReadTheDocs](https://c1-coursework-docs.readthedocs.io/en/latest)
* [FiveDReg PyPI Package](https://pypi.org/project/fivedreg/#description)

## Quickstart

### Starting the Application

Use the provided helper script to start the application with Docker Compose.

**Normal Start (Detached Mode):**
Runs containers in the background.

```bash
./start.sh
```

**Developer Mode (Attached Mode):**
Runs containers in the foreground with live logs visible in your terminal.

```bash
./start.sh --dev
```

### Stopping the Application

Stops all container services and performs a comprehensive cleanup (removes containers, volumes, networks, and unused data).

```bash
./stop.sh
```

## Running Tests

### Prerequisites
Ensure you have the test dependencies installed:

```bash
pip install pytest pytest-timeout httpx
```

Or if using the backend virtual environment:

```bash
cd backend
source venv/bin/activate
pip install pytest pytest-timeout httpx
```

### Running the Test Suite

Navigate to the backend directory and run pytest:

```bash
cd backend
python -m pytest
```

### Test Commands

| Command | Description |
|---------|-------------|
| `python -m pytest` | Run all tests |
| `python -m pytest -v` | Run with verbose output |
| `python -m pytest -m "not slow"` | Skip slow performance tests |
| `python -m pytest -m slow` | Run only slow performance tests (10k samples) |
| `python -m pytest tests/test_data.py` | Run only data processing tests |
| `python -m pytest tests/test_model.py` | Run only model tests |
| `python -m pytest tests/test_api.py` | Run only API integration tests |
| `python -m pytest --tb=long` | Show full tracebacks on failure |

### Test Structure

The test suite is located in `backend/tests/` and includes:

- **`test_data.py`** - Tests for the `fivedreg` data processing functionality (DataLoader, validation, summaries)
- **`test_model.py`** - Tests for the neural network (initialization, forward pass, training loop, performance constraints)
- **`test_api.py`** - FastAPI integration tests (`/health`, `/upload`, `/train`, `/predict` endpoints)
- **`conftest.py`** - Shared pytest fixtures for test data generation

### Performance Tests

The test suite includes a critical performance test that verifies training on 10,000 samples completes in under 60 seconds (as required by the Research Computing specification). These tests are marked with `@pytest.mark.slow` and can be run separately:

```bash
python -m pytest -m slow -v
```

---

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