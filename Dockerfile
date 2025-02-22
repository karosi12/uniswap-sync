FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install @nestjs/cli, @nestjs/core, @nestjs/common  dependencies
RUN npm install @nestjs/cli @nestjs/core @nestjs/common 

# Build the application
RUN npm run build

# Expose the port that your application will run on
EXPOSE 3000

# Specify the command to run the application
CMD ["npm", "run", "start:prod"]
