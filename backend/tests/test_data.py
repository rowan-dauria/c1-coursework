"""
Tests for the data processing functionality of fivedreg.

This module tests:
- DataLoader initialization and file loading
- Data validation (shape, types, missing values)
- Data summary generation
"""

import pytest
import numpy as np
import pickle
import tempfile
import os

import fivedreg
from fivedreg.data import DataLoader


class TestDataLoaderInitialization:
    """Test DataLoader initialization."""

    def test_init_with_valid_path(self, temp_pickle_file):
        """Test that DataLoader initializes with a valid file path."""
        loader = DataLoader(temp_pickle_file)
        assert loader.data_path == temp_pickle_file

    def test_init_stores_path(self):
        """Test that DataLoader stores the provided path."""
        test_path = "/some/test/path.pkl"
        loader = DataLoader(test_path)
        assert loader.data_path == test_path


class TestDataLoading:
    """Test data loading functionality."""

    def test_load_data_returns_dict(self, temp_pickle_file):
        """Test that load_data returns a dictionary."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()
        assert isinstance(data, dict)

    def test_load_data_has_required_keys(self, temp_pickle_file):
        """Test that loaded data has X, y, and metadata keys."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()

        assert 'X' in data
        assert 'y' in data
        assert 'metadata' in data

    def test_load_data_x_shape(self, temp_pickle_file, sample_5d_data):
        """Test that X has correct shape (n_samples, 5)."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()

        X_expected, _ = sample_5d_data
        assert data['X'].shape == X_expected.shape
        assert data['X'].shape[1] == 5  # 5D data

    def test_load_data_y_shape(self, temp_pickle_file, sample_5d_data):
        """Test that y has correct shape."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()

        _, y_expected = sample_5d_data
        assert data['y'].shape == y_expected.shape

    def test_load_data_arrays_are_numpy(self, temp_pickle_file):
        """Test that X and y are numpy arrays."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()

        assert isinstance(data['X'], np.ndarray)
        assert isinstance(data['y'], np.ndarray)

    def test_load_nonexistent_file_raises_error(self):
        """Test that loading a nonexistent file raises an error."""
        loader = DataLoader("/nonexistent/path/file.pkl")

        with pytest.raises(FileNotFoundError):
            loader.load_data()

    def test_load_data_values_match(self, temp_pickle_file, sample_5d_data):
        """Test that loaded data values match original."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()

        X_expected, y_expected = sample_5d_data
        np.testing.assert_array_almost_equal(data['X'], X_expected)
        np.testing.assert_array_almost_equal(data['y'], y_expected)


class TestDataSummary:
    """Test data summary functionality."""

    def test_get_data_summary_returns_dict(self, temp_pickle_file):
        """Test that get_data_summary returns a dictionary."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()
        summary = loader.get_data_summary(data)

        assert isinstance(summary, dict)

    def test_get_data_summary_has_required_keys(self, temp_pickle_file):
        """Test that summary has expected structure."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()
        summary = loader.get_data_summary(data)

        assert 'dataset_structure' in summary
        assert 'feature_matrix' in summary
        assert 'target_vector' in summary
        assert 'metadata' in summary
        assert 'validation' in summary

    def test_get_data_summary_feature_matrix_info(self, temp_pickle_file):
        """Test that feature matrix info is correct."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()
        summary = loader.get_data_summary(data)

        assert 'shape' in summary['feature_matrix']
        assert 'dtype' in summary['feature_matrix']
        assert summary['feature_matrix']['shape'][1] == 5

    def test_get_data_summary_validation_no_nan(self, temp_pickle_file):
        """Test that validation reports no NaN for clean data."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()
        summary = loader.get_data_summary(data)

        assert summary['validation']['nan_count_x'] == 0
        assert summary['validation']['nan_count_y'] == 0

    def test_get_data_summary_sample_sizes_match(self, temp_pickle_file):
        """Test that validation confirms matching sample sizes."""
        loader = DataLoader(temp_pickle_file)
        data = loader.load_data()
        summary = loader.get_data_summary(data)

        assert summary['validation']['sample_size_mismatch'] == False

    def test_get_data_summary_invalid_input_raises_error(self, temp_pickle_file):
        """Test that invalid input raises ValueError."""
        loader = DataLoader(temp_pickle_file)

        with pytest.raises(ValueError):
            loader.get_data_summary("not a dict")

    def test_get_data_summary_missing_keys_raises_error(self, temp_pickle_file):
        """Test that missing required keys raises ValueError."""
        loader = DataLoader(temp_pickle_file)
        incomplete_data = {'X': np.array([1, 2, 3])}

        with pytest.raises(ValueError):
            loader.get_data_summary(incomplete_data)


class TestDataWithNaN:
    """Test handling of data with NaN values."""

    def test_detect_nan_in_x(self):
        """Test that NaN values in X are detected."""
        # Create data with NaN
        X = np.array([[1.0, 2.0, 3.0, 4.0, 5.0],
                      [np.nan, 2.0, 3.0, 4.0, 5.0]])
        y = np.array([1.0, 2.0])

        data = {
            'X': X,
            'y': y,
            'metadata': {'description': 'Test with NaN'}
        }

        with tempfile.NamedTemporaryFile(mode='wb', suffix='.pkl', delete=False) as f:
            pickle.dump(data, f)
            temp_path = f.name

        try:
            loader = DataLoader(temp_path)
            loaded_data = loader.load_data()
            summary = loader.get_data_summary(loaded_data)

            assert summary['validation']['nan_count_x'] == 1
        finally:
            os.remove(temp_path)

    def test_detect_nan_in_y(self):
        """Test that NaN values in y are detected."""
        X = np.array([[1.0, 2.0, 3.0, 4.0, 5.0],
                      [1.0, 2.0, 3.0, 4.0, 5.0]])
        y = np.array([1.0, np.nan])

        data = {
            'X': X,
            'y': y,
            'metadata': {'description': 'Test with NaN in y'}
        }

        with tempfile.NamedTemporaryFile(mode='wb', suffix='.pkl', delete=False) as f:
            pickle.dump(data, f)
            temp_path = f.name

        try:
            loader = DataLoader(temp_path)
            loaded_data = loader.load_data()
            summary = loader.get_data_summary(loaded_data)

            assert summary['validation']['nan_count_y'] == 1
        finally:
            os.remove(temp_path)

