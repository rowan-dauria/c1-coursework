User Guide
==========

Introduction
------------

``fivedreg`` provides a lightweight neural network implementation specifically optimized for 5-dimensional regression tasks on CPUs. It wraps TensorFlow/Keras functionality in a simple, scikit-learn compatible API.

Data Preparation
----------------

The model expects input data to have exactly 5 features (columns).

.. code-block:: python

    import numpy as np
    import pandas as pd

    # Create dummy 5D data
    X = pd.DataFrame(
        np.random.randn(100, 5),
        columns=['x1', 'x2', 'x3', 'x4', 'x5']
    )
    y = np.random.randn(100)

Initializing the Model
----------------------

You can customize the model architecture using ``hidden_layers``, ``activation``, and training parameters like ``learning_rate`` and ``max_iter``.

.. code-block:: python

    from fivedreg import LightweightNN

    # Default model (Layers: [64, 32, 16], ReLU, LR: 0.001)
    model = LightweightNN()

    # Custom architecture
    custom_model = LightweightNN(
        hidden_layers=[128, 64, 32],
        activation='tanh',
        learning_rate=0.01,
        max_iter=500,
        random_state=42
    )

Training
--------

Train the model using the ``fit`` method. The model supports early stopping.

.. code-block:: python

    # Train the model
    model.fit(X, y)

    # Train with early stopping enabled
    model.fit(X, y, early_stopping=True)

    # Check if training was successful
    print(f"Model fitted: {model.is_fitted_}")

You can access the training history after fitting:

.. code-block:: python

    history = model.get_history()
    print(history.history['loss'])

Making Predictions
------------------

Once trained, use ``predict`` to get regression outputs. The input must also be 5-dimensional.

.. code-block:: python

    # Make predictions on new data
    X_new = pd.DataFrame(np.random.randn(5, 5), columns=X.columns)
    predictions = model.predict(X_new)

    print(predictions)

Performance
-----------

The library is designed to train on 10,000 samples in under 60 seconds on standard hardware, making it suitable for rapid prototyping and research computing tasks where efficiency is key.
