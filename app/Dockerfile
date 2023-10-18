FROM node:16.17-alpine3.16

WORKDIR /app
COPY package*.json /app/
RUN npm install
RUN npm i -g nodemon
COPY . .
CMD npm run devstart