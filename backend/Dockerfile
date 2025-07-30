# Use NVIDIA CUDA base image with Python and GPU support
FROM nvidia/cuda:12.6.0-runtime-ubuntu22.04

# Set working directory
WORKDIR /app

# Install Python 3.12
RUN apt-get update && \
    apt-get install -y python3-pip python3-dev python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# pytorch with gpu support
RUN --mount=type=cache,target=/root/.cache/pip pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

# Copy app source code
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Command to run the FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
