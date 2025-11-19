from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import shutil
from fastapi.middleware.cors import CORSMiddleware

import dummy_package_rd
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


@app.get("/api")
async def hello_world():
    return {"message": "Hello from the backend world!"}

@app.get("/dummy-package-version")
async def version():
    try:
        return {"version": dummy_package_rd.__version__}
    except:
        return {"error": "Could not resolve version"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.pkl'):
        raise HTTPException(status_code=400, detail="Only .pkl files are allowed")

    os.makedirs("data", exist_ok=True)
    file_location = "data/data.pkl"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "File uploaded successfully"}

