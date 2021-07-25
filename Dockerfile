FROM node:14.17.3-buster

WORKDIR /app

RUN apt-get update && \
    yarn install && \
    npm install -g firebase-tools

EXPOSE 3000
