FROM mhart/alpine-node:11 AS builder
 
WORKDIR /app
COPY . .

RUN npm install file-saver --save
RUN npm install

ENTRYPOINT npm start -- --port=$PORT