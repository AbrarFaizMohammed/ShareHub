FROM node:latest
WORKDIR /app
COPY . /app
RUN npm install 
RUN npm install bcrypt
EXPOSE 3000
CMD node server.js

