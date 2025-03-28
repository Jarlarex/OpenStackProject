FROM mongo:latest

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
ENV MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}

# Create directory for data
RUN mkdir -p /data/db

# Set permissions
RUN chown -R mongodb:mongodb /data/db

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB
CMD ["mongod"]
