"""
Tests for fivedreg.data.DataLoader
"""
import pytest
import pandas as pd
import numpy as np
import tempfile
import pickle
import os
from fivedreg.data import DataLoader


class TestDataLoader:
    """Test suite for DataLoader class."""

    def test_initialization(self):
        """Test that DataLoader initializes with a data path."""
        data_path = "/path/to/data.pkl"
        loader = DataLoader(data_path)
        assert loader.data_path == data_path

    def test_load_data_from_pickle(self):
        """Test that load_data loads a DataFrame from a pickle file."""
        # Create a temporary DataFrame
        test_data = pd.DataFrame({
            'col1': [1, 2, 3, 4, 5],
            'col2': [10, 20, 30, 40, 50],
            'col3': [100, 200, 300, 400, 500]
        })

        # Create a temporary pickle file
        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.pkl') as f:
            pickle.dump(test_data, f)
            temp_path = f.name

        try:
            # Test loading
            loader = DataLoader(temp_path)
            loaded_data = loader.load_data()

            assert isinstance(loaded_data, pd.DataFrame)
            assert loaded_data.shape == test_data.shape
            pd.testing.assert_frame_equal(loaded_data, test_data)
        finally:
            # Clean up
            os.unlink(temp_path)

    def test_load_data_nonexistent_file_raises_error(self):
        """Test that load_data raises an error for nonexistent file."""
        loader = DataLoader("/nonexistent/path/data.pkl")
        with pytest.raises((FileNotFoundError, IOError)):
            loader.load_data()

    def test_print_data_summary(self, capsys):
        """Test that print_data_summary prints data information."""
        test_data = pd.DataFrame({
            'col1': [1, 2, 3],
            'col2': [10, 20, 30]
        })

        loader = DataLoader("/dummy/path")
        loader.print_data_summary(test_data)

        captured = capsys.readouterr()
        assert "Data Info:" in captured.out
        assert "Data Shape" in captured.out
        assert "Column Names" in captured.out



