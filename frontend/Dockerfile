# frontend/Dockerfile
FROM node:24-alpine3.21

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build the Next.js app
RUN npm run build

# Expose and run
EXPOSE 3000
CMD ["npm", "run", "start"]
