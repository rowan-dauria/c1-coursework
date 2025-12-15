"""
Shared pytest fixtures for the backend test suite.
"""

import pytest
import numpy as np
import pandas as pd
import os
import tempfile
import pickle


@pytest.fixture
def sample_5d_data():
    """Generate sample 5D data for testing."""
    np.random.seed(42)
    n_samples = 100
    X = np.random.randn(n_samples, 5)
    y = np.random.randn(n_samples)
    return X, y


@pytest.fixture
def sample_5d_dataframe():
    """Generate sample 5D data as pandas DataFrames."""
    np.random.seed(42)
    n_samples = 100
    X = pd.DataFrame(
        np.random.randn(n_samples, 5),
        columns=['x1', 'x2', 'x3', 'x4', 'x5']
    )
    y = pd.DataFrame(np.random.randn(n_samples, 1), columns=['target'])
    return X, y


@pytest.fixture
def large_dataset_10k():
    """Generate 10,000 samples for performance testing."""
    np.random.seed(42)
    n_samples = 10000
    X = np.random.randn(n_samples, 5)
    y = np.random.randn(n_samples)
    return X, y


@pytest.fixture
def temp_pickle_file(sample_5d_data):
    """Create a temporary pickle file with test data."""
    X, y = sample_5d_data
    data = {
        'X': X,
        'y': y,
        'metadata': {
            'description': 'Test dataset',
            'n_samples': len(X),
            'n_features': X.shape[1]
        }
    }

    with tempfile.NamedTemporaryFile(mode='wb', suffix='.pkl', delete=False) as f:
        pickle.dump(data, f)
        temp_path = f.name

    yield temp_path

    # Cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)


@pytest.fixture
def temp_npz_file(sample_5d_data):
    """Create a temporary npz file with test data."""
    X, y = sample_5d_data

    with tempfile.NamedTemporaryFile(suffix='.npz', delete=False) as f:
        np.savez(f, X=X, y=y)
        temp_path = f.name

    yield temp_path

    # Cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)


@pytest.fixture
def trained_model(sample_5d_dataframe):
    """Provide a pre-trained model for prediction tests."""
    import fivedreg

    X, y = sample_5d_dataframe
    model = fivedreg.LightweightNN(
        hidden_layers=[32, 16],
        learning_rate=0.01,
        max_iter=10,
        random_state=42,
        verbose=0
    )
    model.fit(X, y)
    return model

