FROM node:9

WORKDIR /app

COPY package.json .
RUN npm install
RUN npm install --save node-opcua

COPY . .

USER node
EXPOSE 8080

CMD ["npm", "start"]