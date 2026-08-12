FROM node:24-alpine AS dev

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm install

COPY client client

WORKDIR /app/client

EXPOSE 5173

CMD ["npm", "run", "dev"]
