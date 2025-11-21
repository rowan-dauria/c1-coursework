from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import shutil
from fastapi.middleware.cors import CORSMiddleware
# todo: change this back to a regular import before pushing to gitlab
from fiveD_NN_package import fivedreg

model = fivedreg.LightweightNN(output_activation="linear", random_state=42)

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
    data_loader = fivedreg.data.DataLoader("data/data.pkl")
    dataset = data_loader.load_data()
    try:
        model.fit(dataset['X'], dataset['y'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {e}")
    return {"message": "Model trained successfully", "model_summary": model.summary()}

@app.get("/package-version")
async def get_version():
    """
    Returns the current version of the fiveD_NN_package.
    """
    return {"version": fivedreg.__version__}


