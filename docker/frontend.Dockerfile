FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Setup environment
COPY frontend/.env.local ./.env.local

# Expose the port the app runs on
EXPOSE 3000

# Set Node environment
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

# Command to run the development server
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
