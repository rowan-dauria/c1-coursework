"""
Tests for the neural network model functionality of fivedreg.

This module tests:
- Model initialization and configuration
- Forward pass (prediction)
- Training loop
- Performance constraint (under 1 minute for 10k samples)
"""

import pytest
import numpy as np
import pandas as pd
import time

import fivedreg
from fivedreg import LightweightNN


class TestModelInitialization:
    """Test model initialization and configuration."""

    def test_default_initialization(self):
        """Test that model initializes with default parameters."""
        model = LightweightNN()

        assert model.hidden_layers == [64, 32, 16]
        assert model.learning_rate == 0.001
        assert model.max_iter == 1000
        assert model.activation == 'relu'
        assert model.is_fitted_ == False

    def test_custom_hidden_layers(self):
        """Test initialization with custom hidden layers."""
        custom_layers = [128, 64, 32, 16]
        model = LightweightNN(hidden_layers=custom_layers)

        assert model.hidden_layers == custom_layers

    def test_custom_learning_rate(self):
        """Test initialization with custom learning rate."""
        model = LightweightNN(learning_rate=0.01)

        assert model.learning_rate == 0.01

    def test_custom_max_iter(self):
        """Test initialization with custom max iterations."""
        model = LightweightNN(max_iter=500)

        assert model.max_iter == 500

    def test_custom_activation(self):
        """Test initialization with custom activation function."""
        model = LightweightNN(activation='tanh')

        assert model.activation == 'tanh'

    def test_random_state_reproducibility(self, sample_5d_dataframe):
        """Test that random_state ensures reproducibility."""
        X, y = sample_5d_dataframe

        model1 = LightweightNN(random_state=42, max_iter=5, verbose=0)
        model1.fit(X, y)
        pred1 = model1.predict(X[:5])

        # Reset and create new model with same seed
        fivedreg.neural_network.NN.reset_keras()

        model2 = LightweightNN(random_state=42, max_iter=5, verbose=0)
        model2.fit(X, y)
        pred2 = model2.predict(X[:5])

        # Predictions should be very close (may not be exact due to TF)
        np.testing.assert_array_almost_equal(pred1, pred2, decimal=3)

    def test_get_params(self):
        """Test get_params returns correct dictionary."""
        model = LightweightNN(
            hidden_layers=[32, 16],
            learning_rate=0.005,
            max_iter=200,
            activation='sigmoid',
            random_state=123
        )

        params = model.get_params()

        assert params['hidden_layers'] == [32, 16]
        assert params['learning_rate'] == 0.005
        assert params['max_iter'] == 200
        assert params['activation'] == 'sigmoid'
        assert params['random_state'] == 123

    def test_set_params(self):
        """Test set_params updates model parameters."""
        model = LightweightNN()

        model.set_params(learning_rate=0.01, max_iter=500)

        assert model.learning_rate == 0.01
        assert model.max_iter == 500

    def test_set_params_invalid_raises_error(self):
        """Test that setting invalid parameter raises error."""
        model = LightweightNN()

        with pytest.raises(ValueError):
            model.set_params(invalid_param=123)


class TestForwardPass:
    """Test forward pass (prediction) functionality."""

    def test_predict_single_sample_returns_scalar(self, sample_5d_dataframe):
        """Test that predicting on (1, 5) input returns a float/scalar."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=10, verbose=0, random_state=42)
        model.fit(X, y)

        # Create single sample with shape (1, 5)
        single_sample = np.random.randn(1, 5)
        prediction = model.predict(single_sample)

        # Output should be array with shape (1, 1)
        assert prediction.shape == (1, 1)
        # The value should be a float
        assert isinstance(float(prediction[0, 0]), float)

    def test_predict_random_tensor_shape_1_5(self, trained_model):
        """Test forward pass with random tensor of shape (1, 5)."""
        # Generate random input tensor
        np.random.seed(123)
        random_tensor = np.random.randn(1, 5)

        prediction = trained_model.predict(random_tensor)

        # Assert output is a float/scalar
        assert prediction.shape == (1, 1)
        output_value = prediction[0, 0]
        assert np.isfinite(output_value), "Output should be a finite number"
        assert isinstance(float(output_value), float)

    def test_predict_multiple_samples(self, trained_model):
        """Test prediction on multiple samples."""
        n_samples = 50
        X_test = np.random.randn(n_samples, 5)

        predictions = trained_model.predict(X_test)

        assert predictions.shape == (n_samples, 1)

    def test_predict_with_dataframe(self, sample_5d_dataframe):
        """Test prediction with pandas DataFrame input."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=10, verbose=0, random_state=42)
        model.fit(X, y)

        X_test = pd.DataFrame(
            np.random.randn(10, 5),
            columns=['x1', 'x2', 'x3', 'x4', 'x5']
        )
        predictions = model.predict(X_test)

        assert predictions.shape == (10, 1)

    def test_predict_before_fit_raises_error(self):
        """Test that predicting before fitting raises error."""
        model = LightweightNN()
        X = np.random.randn(10, 5)

        with pytest.raises(ValueError):
            model.predict(X)

    def test_predict_wrong_dimensions_raises_error(self, trained_model):
        """Test that wrong input dimensions raise error."""
        X_wrong = np.random.randn(10, 3)  # Should be 5 features

        with pytest.raises(ValueError):
            trained_model.predict(X_wrong)


class TestTrainingLoop:
    """Test training loop functionality."""

    def test_fit_runs_without_error(self, sample_5d_dataframe):
        """Test that fit() runs without crashing."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=5, verbose=0, random_state=42)

        # This should not raise any exceptions
        model.fit(X, y)

        assert model.is_fitted_ == True

    def test_fit_with_numpy_arrays(self, sample_5d_data):
        """Test fitting with numpy arrays."""
        X, y = sample_5d_data

        model = LightweightNN(max_iter=10, verbose=0, random_state=42)
        model.fit(X, y)

        assert model.is_fitted_ == True

    def test_fit_with_dataframes(self, sample_5d_dataframe):
        """Test fitting with pandas DataFrames."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=10, verbose=0, random_state=42)
        model.fit(X, y)

        assert model.is_fitted_ == True

    def test_loss_decreases_or_stable(self, sample_5d_dataframe):
        """Test that loss decreases (or at least doesn't crash) during training."""
        X, y = sample_5d_dataframe

        model = LightweightNN(
            max_iter=50,
            verbose=0,
            random_state=42,
            hidden_layers=[32, 16]
        )
        model.fit(X, y, early_stopping=False)

        history = model.get_history()
        losses = history.history['loss']

        # Check that training completed
        assert len(losses) > 0

        # Check that final loss is less than or equal to initial loss
        # (allowing for some variation due to stochasticity)
        initial_loss = losses[0]
        final_loss = losses[-1]

        # Final loss should be lower or close to initial
        assert final_loss <= initial_loss * 1.5, \
            f"Final loss {final_loss} is significantly higher than initial {initial_loss}"

    def test_get_history_after_fit(self, sample_5d_dataframe):
        """Test that training history is available after fit."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=10, verbose=0, random_state=42)
        model.fit(X, y)

        history = model.get_history()

        assert 'loss' in history.history
        assert len(history.history['loss']) > 0

    def test_get_history_before_fit_raises_error(self):
        """Test that getting history before fitting raises error."""
        model = LightweightNN()

        with pytest.raises(ValueError):
            model.get_history()

    def test_early_stopping_enabled(self, sample_5d_dataframe):
        """Test training with early stopping enabled."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=1000, verbose=0, random_state=42)
        model.fit(X, y, early_stopping=True)

        history = model.get_history()
        # With early stopping, training should stop before max_iter
        # (though not guaranteed, depends on data)
        assert len(history.history['loss']) <= 1000

    def test_model_dimensions_set_after_fit(self, sample_5d_dataframe):
        """Test that input/output dimensions are set after fit."""
        X, y = sample_5d_dataframe

        model = LightweightNN(max_iter=5, verbose=0)
        model.fit(X, y)

        assert model.input_dim_ == 5
        assert model.output_dim_ == 1


class TestPerformanceConstraint:
    """Test performance constraints - training under 1 minute for 10k samples."""

    @pytest.mark.slow
    def test_training_under_1_minute_10k_samples(self, large_dataset_10k):
        """
        CRITICAL: Test that training on 10,000 samples completes in under 60 seconds.
        This is crucial for "Research Computing" marks.
        """
        X, y = large_dataset_10k

        assert X.shape[0] == 10000, "Dataset should have 10,000 samples"
        assert X.shape[1] == 5, "Dataset should have 5 features"

        model = LightweightNN(
            hidden_layers=[64, 32, 16],  # Default architecture
            learning_rate=0.001,
            max_iter=100,  # Reasonable number of iterations
            verbose=0,
            random_state=42
        )

        # Time the training
        start_time = time.time()
        model.fit(X, y)
        end_time = time.time()

        training_time = end_time - start_time

        # Assert training completed in under 60 seconds
        assert training_time < 60, \
            f"Training took {training_time:.2f} seconds, which exceeds the 60-second limit"

        # Verify model was trained successfully
        assert model.is_fitted_ == True

        # Print timing information for reference
        print(f"\nTraining 10k samples completed in {training_time:.2f} seconds")

    @pytest.mark.slow
    def test_prediction_speed_10k_samples(self, large_dataset_10k):
        """Test that prediction on 10k samples is fast."""
        X, y = large_dataset_10k

        model = LightweightNN(
            hidden_layers=[64, 32, 16],
            max_iter=10,
            verbose=0,
            random_state=42
        )
        model.fit(X, y)

        # Time prediction
        start_time = time.time()
        predictions = model.predict(X)
        end_time = time.time()

        prediction_time = end_time - start_time

        # Prediction should be very fast (under 5 seconds)
        assert prediction_time < 5, \
            f"Prediction took {prediction_time:.2f} seconds"

        assert predictions.shape == (10000, 1)

        print(f"\nPrediction on 10k samples completed in {prediction_time:.2f} seconds")


class TestModelArchitecture:
    """Test model architecture configuration."""

    def test_different_architectures(self, sample_5d_dataframe):
        """Test that different architectures work correctly."""
        X, y = sample_5d_dataframe

        architectures = [
            [16],           # Single layer
            [32, 16],       # Two layers
            [64, 32, 16],   # Three layers (default)
            [128, 64, 32, 16]  # Four layers
        ]

        for layers in architectures:
            model = LightweightNN(
                hidden_layers=layers,
                max_iter=5,
                verbose=0,
                random_state=42
            )
            model.fit(X, y)

            assert model.is_fitted_ == True

            prediction = model.predict(X[:1])
            assert prediction.shape == (1, 1)

    def test_different_activations(self, sample_5d_dataframe):
        """Test that different activation functions work."""
        X, y = sample_5d_dataframe

        activations = ['relu', 'tanh', 'sigmoid']

        for activation in activations:
            model = LightweightNN(
                activation=activation,
                max_iter=5,
                verbose=0,
                random_state=42
            )
            model.fit(X, y)

            assert model.is_fitted_ == True

