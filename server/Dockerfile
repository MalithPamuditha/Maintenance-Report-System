FROM node:24-alpine AS dev

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm install

COPY server server

WORKDIR /app/server

RUN npm run prisma:generate

EXPOSE 4000

CMD ["npm", "run", "dev"]
