FROM node:18

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Set working directory
WORKDIR /app

# Copy backend code into container
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5555

# Start the app
CMD ["npm", "start"]
