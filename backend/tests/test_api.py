"""
API Integration Tests for the FastAPI backend.

This module uses fastapi.testclient.TestClient to treat the running API as a black box.
Tests the "Full Stack" aspect of the system.

Tests include:
- Health endpoint
- File upload endpoint
- Training endpoint
- Prediction endpoint
"""

import pytest
import os
import tempfile
import pickle
import numpy as np
from fastapi.testclient import TestClient
import shutil

# Import the FastAPI app
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_pickle_data():
    """Create sample data in pickle format for upload testing."""
    np.random.seed(42)
    n_samples = 100
    X = np.random.randn(n_samples, 5)
    y = np.random.randn(n_samples)

    data = {
        'X': X,
        'y': y,
        'metadata': {
            'description': 'Test dataset for API',
            'n_samples': n_samples,
            'n_features': 5
        }
    }
    return data


@pytest.fixture
def temp_pickle_file_api(sample_pickle_data):
    """Create a temporary pickle file for upload testing."""
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.pkl', delete=False) as f:
        pickle.dump(sample_pickle_data, f)
        temp_path = f.name

    yield temp_path

    # Cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)


@pytest.fixture
def temp_npz_file_api(sample_pickle_data):
    """Create a temporary npz file for testing."""
    X = sample_pickle_data['X']
    y = sample_pickle_data['y']

    with tempfile.NamedTemporaryFile(suffix='.npz', delete=False) as f:
        np.savez(f, X=X, y=y)
        temp_path = f.name

    yield temp_path

    # Cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)


@pytest.fixture(autouse=True)
def cleanup_data_dir():
    """Cleanup the data directory after each test."""
    yield
    # Cleanup after test
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    if os.path.exists(data_dir):
        # Don't remove the directory, just clean up test files if needed
        pass


class TestHealthEndpoint:
    """Test the /health endpoint."""

    def test_health_status_code_200(self, client):
        """Test that /health returns status code 200."""
        response = client.get("/health")

        assert response.status_code == 200

    def test_health_response_body(self, client):
        """Test that /health returns {"status": "OK"}."""
        response = client.get("/health")

        data = response.json()
        assert "status" in data
        # Note: The actual API returns "OK" (uppercase)
        assert data["status"].lower() == "ok"

    def test_health_response_format(self, client):
        """Test that /health response is valid JSON."""
        response = client.get("/health")

        # Should not raise an exception
        data = response.json()
        assert isinstance(data, dict)


class TestUploadEndpoint:
    """Test the /upload endpoint."""

    def test_upload_pkl_file_success(self, client, temp_pickle_file_api):
        """Test uploading a valid .pkl file."""
        with open(temp_pickle_file_api, 'rb') as f:
            response = client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "uploaded successfully" in data["message"].lower()

    def test_upload_creates_file(self, client, temp_pickle_file_api):
        """Test that uploading saves the file to server storage."""
        with open(temp_pickle_file_api, 'rb') as f:
            response = client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )

        assert response.status_code == 200

        # Check that the file was saved
        data_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'data', 'data.pkl'
        )
        assert os.path.exists(data_path)

    def test_upload_returns_data_summary(self, client, temp_pickle_file_api):
        """Test that upload returns a data summary."""
        with open(temp_pickle_file_api, 'rb') as f:
            response = client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )

        assert response.status_code == 200
        data = response.json()
        assert "data_summary" in data
        assert "feature_matrix" in data["data_summary"]

    def test_upload_wrong_file_type_rejected(self, client):
        """Test that non-.pkl files are rejected."""
        # Create a dummy file with wrong extension
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
            f.write(b"This is not a pickle file")
            temp_path = f.name

        try:
            with open(temp_path, 'rb') as f:
                response = client.post(
                    "/upload",
                    files={"file": ("test_data.txt", f, "text/plain")}
                )

            assert response.status_code == 400
            assert "pkl" in response.json()["detail"].lower()
        finally:
            os.remove(temp_path)

    def test_upload_without_file_fails(self, client):
        """Test that uploading without a file fails."""
        response = client.post("/upload")

        assert response.status_code == 422  # Validation error


class TestTrainEndpoint:
    """Test the /train endpoint."""

    def test_train_without_data_fails(self, client):
        """Test that training without uploaded data fails."""
        # Ensure no data file exists
        data_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'data', 'data.pkl'
        )
        if os.path.exists(data_path):
            os.remove(data_path)

        response = client.post("/train", json={})

        assert response.status_code == 404
        assert "file not found" in response.json()["detail"].lower()

    def test_train_success(self, client, temp_pickle_file_api):
        """Test that training returns success message."""
        # First upload the data
        with open(temp_pickle_file_api, 'rb') as f:
            upload_response = client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )
        assert upload_response.status_code == 200

        # Then train
        response = client.post("/train", json={
            "max_iter": 5  # Use few iterations for speed
        })

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "success" in data["message"].lower()

    def test_train_returns_model_structure(self, client, temp_pickle_file_api):
        """Test that training returns model structure information."""
        # Upload data
        with open(temp_pickle_file_api, 'rb') as f:
            client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )

        # Train
        response = client.post("/train", json={"max_iter": 5})

        assert response.status_code == 200
        data = response.json()
        assert "model_structure" in data
        assert isinstance(data["model_structure"], list)

    def test_train_with_custom_params(self, client, temp_pickle_file_api):
        """Test training with custom hyperparameters."""
        # Upload data
        with open(temp_pickle_file_api, 'rb') as f:
            client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )

        # Train with custom parameters
        response = client.post("/train", json={
            "hidden_layers": [32, 16],
            "learning_rate": 0.01,
            "max_iter": 5,
            "activation": "tanh"
        })

        assert response.status_code == 200


class TestPredictEndpoint:
    """Test the /predict endpoint."""

    def test_predict_success(self, client, temp_pickle_file_api):
        """Test making a prediction with valid features."""
        # Upload and train first
        with open(temp_pickle_file_api, 'rb') as f:
            client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )
        client.post("/train", json={"max_iter": 10})

        # Make prediction
        response = client.post("/predict", json={
            "x1": 0.1,
            "x2": 0.2,
            "x3": 0.3,
            "x4": 0.4,
            "x5": 0.5
        })

        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert isinstance(data["prediction"], float)

    def test_predict_with_features_list_format(self, client, temp_pickle_file_api):
        """Test prediction with the features format specified in requirements."""
        # Upload and train first
        with open(temp_pickle_file_api, 'rb') as f:
            client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )
        client.post("/train", json={"max_iter": 10})

        # Make prediction using x1-x5 format
        features = {"x1": 0.1, "x2": 0.2, "x3": 0.3, "x4": 0.4, "x5": 0.5}
        response = client.post("/predict", json=features)

        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data

    def test_predict_missing_features_fails(self, client, temp_pickle_file_api):
        """Test that prediction with missing features fails."""
        # Upload and train first
        with open(temp_pickle_file_api, 'rb') as f:
            client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )
        client.post("/train", json={"max_iter": 10})

        # Try to predict with missing features
        response = client.post("/predict", json={
            "x1": 0.1,
            "x2": 0.2,
            "x3": 0.3
            # Missing x4 and x5
        })

        assert response.status_code == 400
        assert "missing" in response.json()["detail"].lower()

    def test_predict_returns_numeric_value(self, client, temp_pickle_file_api):
        """Test that prediction returns a numeric value."""
        # Upload and train
        with open(temp_pickle_file_api, 'rb') as f:
            client.post(
                "/upload",
                files={"file": ("test_data.pkl", f, "application/octet-stream")}
            )
        client.post("/train", json={"max_iter": 10})

        # Predict
        response = client.post("/predict", json={
            "x1": 0.1,
            "x2": 0.2,
            "x3": 0.3,
            "x4": 0.4,
            "x5": 0.5
        })

        data = response.json()
        prediction = data["prediction"]

        # Check it's a valid number
        assert isinstance(prediction, (int, float))
        assert np.isfinite(prediction)


class TestApiVersionEndpoint:
    """Test the /package-version endpoint."""

    def test_get_version(self, client):
        """Test that version endpoint returns package version."""
        response = client.get("/package-version")

        assert response.status_code == 200
        data = response.json()
        assert "version" in data


class TestApiEndpoint:
    """Test the /api endpoint."""

    def test_api_hello_world(self, client):
        """Test the basic API endpoint."""
        response = client.get("/api")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

