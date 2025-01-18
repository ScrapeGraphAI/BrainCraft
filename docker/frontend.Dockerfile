FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the development server
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
