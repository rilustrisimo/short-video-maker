# This is a Docker-based project
# Use main-tiny.Dockerfile for deployment
FROM ubuntu:22.04
COPY . /app
WORKDIR /app
CMD ["echo", "Use main-tiny.Dockerfile for actual deployment"]
