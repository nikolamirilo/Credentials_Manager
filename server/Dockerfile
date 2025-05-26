FROM node:23
COPY package*.json ./
RUN npm install -g npm@11.1.0
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]