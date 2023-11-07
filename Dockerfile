# Nodejs 20 Alpine Linux as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json
COPY package.json  ./

# Install necessary dependencies for the build
RUN apk update && apk add --no-cache git bash

# Install Node.js dependencies (including dev dependencies)
RUN yarn install

# Copy the entire application source code
COPY . .

# Build the TypeScript code (assuming you have a "build" script in your package.json)
RUN yarn build

# Expose the port your application listens on (if necessary)
EXPOSE 5000

# Start your Node.js application
CMD ["node", "dist/index.js"]
