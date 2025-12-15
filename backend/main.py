from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import shutil
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
# todo: change this back to a regular import before pushing to gitlab
import fivedreg

model = fivedreg.LightweightNN(
    output_activation="linear",
    random_state=42,
    verbose=2,
    max_iter=100
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Browser origin (when accessing from host machine)
        #"http://frontend:3000",   # Docker internal network (if needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "OK"}

@app.get("/api")
async def hello_world():
    return {"message": "Hello from the backend world!"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.pkl'):
        raise HTTPException(status_code=400, detail="Only .pkl files are allowed")

    os.makedirs("data", exist_ok=True)
    file_location = "data/data.pkl"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        data_loader = fivedreg.data.DataLoader(file_location)
        ds = data_loader.load_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {e}")

    try:
        data_summary = data_loader.get_data_summary(ds)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting data summary: {e}")

    return {"message": "File uploaded successfully", "data_summary": data_summary}

from pydantic import BaseModel
from typing import List

# ... (existing imports)

class TrainRequest(BaseModel):
    hidden_layers: List[int] = [64, 32, 16]
    learning_rate: float = 0.001
    max_iter: int = 100
    activation: str = 'relu'
    output_activation: str = 'linear'
    random_state: int = 42

@app.post("/train")
async def train(request: TrainRequest):
    try:
        model.reset_keras()
    except Exception as e:
        logging.error(f"Error resetting Keras session: {e}")
        raise HTTPException(status_code=500, detail=f"Error resetting Keras session: {e}")

    logging.info(f"Train endpoint called with params: {request.dict()}")
    # error handling for file not found
    if not os.path.exists("data/data.pkl"):
        logging.error("Training data file not found at data/data.pkl")
        raise HTTPException(status_code=404, detail="File not found. Please upload training data first.")

    try:
        logging.info("Loading data from data/data.pkl")
        data_loader = fivedreg.data.DataLoader("data/data.pkl")
        dataset = data_loader.load_data()

        logging.info("Updating model parameters")
        model.set_params(**request.model_dump())

        logging.info("Starting model training")
        model.fit(dataset['X'], dataset['y'], vs=0.2)

        logging.info("Model training completed successfully")

        # Capture model structure
        model_structure = []
        for layer in model.model.layers:
            try:
                output_shape = layer.output.shape
            except AttributeError:
                output_shape = "N/A"

            layer_info = {
                "name": layer.name,
                "type": layer.__class__.__name__,
                "output_shape": str(output_shape),
                "params": layer.count_params()
            }
            model_structure.append(layer_info)

        return {"message": "Model trained successfully", "model_structure": model_structure}
    except Exception as e:
        logging.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=f"Error training model: {e}")

@app.get("/package-version")
async def get_version():
    """
    Returns the current version of the fiveD_NN_package.
    """
    return {"version": fivedreg.__version__}


@app.get("/history")
async def get_history():
    """
    Returns the training history if the model has been fitted.
    """
    try:
        if not model.is_fitted_:
            raise HTTPException(
                status_code=404,
                detail="Model has not been fitted yet. Please train the model first."
            )

        history = model.get_history()

        # Convert Keras history to JSON-serializable format
        # history.history is a dict with metric names as keys and lists of values as values
        history_dict = {}
        if hasattr(history, 'history') and history.history:
            for metric_name, values in history.history.items():
                # Convert to Python list, handling numpy arrays and ensuring all values are JSON-serializable
                if hasattr(values, 'tolist'):
                    # numpy array
                    history_dict[metric_name] = values.tolist()
                else:
                    # Already a list, but ensure all values are Python types
                    history_dict[metric_name] = [float(v) for v in values]

        return {
            "message": "Training history retrieved successfully",
            "history": history_dict
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error retrieving training history: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving training history: {e}")


@app.post("/predict")
async def predict(data: dict):
    """
    Make predictions using the trained model.
    Expects a JSON body with keys x1, x2, x3, x4, x5.
    """
    try:
        # Validate input
        required_features = ['x1', 'x2', 'x3', 'x4', 'x5']
        missing_features = [f for f in required_features if f not in data]
        if missing_features:
            raise HTTPException(status_code=400, detail=f"Missing required features: {', '.join(missing_features)}")

        # Extract features
        features = [
            float(data['x1']),
            float(data['x2']),
            float(data['x3']),
            float(data['x4']),
            float(data['x5'])
        ]

        # Create DataFrame for prediction (as expected by LightweightNN)
        import pandas as pd
        import numpy as np

        X_pred = pd.DataFrame([features], columns=['x1', 'x2', 'x3', 'x4', 'x5'])

        # Make prediction
        prediction = model.predict(X_pred)

        return {"prediction": float(prediction[0][0])}
    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error making prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Error making prediction: {e}")
