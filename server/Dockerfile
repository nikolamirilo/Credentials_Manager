FROM node:23
WORKDIR /
COPY package*.json ./
RUN npm install -g npm@11.1.0
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]