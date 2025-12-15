#!/bin/bash
# get directory of script
root_dir=$(dirname "$0")

# Create a temporary Python virtual environment for building the docs
python -m venv docs_venv

# Activate the virtual environment
source docs_venv/bin/activate

# Install documentation dependencies from requirements.txt
pip install -r $root_dir/docs/requirements.txt

# Build the Sphinx documentation (output to _build/html)
sphinx-build -b html $root_dir/docs $root_dir/docs/_build/html

# Open the generated documentation in the default web browser
open $root_dir/docs/_build/html/index.html

# Deactivate the virtual environment
deactivate

# Clean up: remove the temporary virtual environment
rm -rf docs_venv