from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()

# API endpoint for qubits (customize data)
@app.get("/api/qubits")
def get_qubits():
    return {
        "results": [
            {"id": 1, "state": "entangled", "amplitude": 0.707, "phase": 0},
            {"id": 2, "state": "superposition", "amplitude": 0.5, "phase": 1.57}
        ]
    }

# Serve your Builder.io exported static files (e.g., from Netlify download)
app.mount("/", StaticFiles(directory="dist", html=True), name="static")  # Adjust 'dist' to your export folder[cite:6]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
