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
    verbose=2
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

    return {"message": "File uploaded successfully"}

@app.get("/train")
async def train():
    logging.info("Train endpoint called")
    # error handling for file not found
    if not os.path.exists("data/data.pkl"):
        logging.error("Training data file not found at data/data.pkl")
        raise HTTPException(status_code=404, detail="File not found. Please upload training data first.")

    try:
        logging.info("Loading data from data/data.pkl")
        data_loader = fivedreg.data.DataLoader("data/data.pkl")
        dataset = data_loader.load_data()

        logging.info("Starting model training")
        model.fit(dataset['X'], dataset['y'])

        logging.info("Model training completed successfully")
        return {"message": "Model trained successfully", "model_summary": model.model.summary()}
    except Exception as e:
        logging.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=f"Error training model: {e}")

@app.get("/package-version")
async def get_version():
    """
    Returns the current version of the fiveD_NN_package.
    """
    return {"version": fivedreg.__version__}


