# Use NVIDIA CUDA base image with Python and GPU support
FROM nvidia/cuda:12.6.0-runtime-ubuntu22.04

# Set working directory
WORKDIR /app

# Install Python 3.12
RUN apt-get update && apt-get install -y \
    software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y python3.12 python3.12-dev python3.12-distutils curl && \
    ln -s /usr/bin/python3.12 /usr/bin/python3 && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3

# Install OS-level dependencies for building some wheels and handling PDFs
RUN apt-get install -y build-essential libpoppler-dev poppler-utils gcc libffi-dev \
    libssl-dev libjpeg-dev zlib1g-dev libxml2-dev libxslt1-dev libpq-dev \
    wkhtmltopdf git

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
