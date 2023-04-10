FROM node:18-alpine AS builder

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine
WORKDIR /home/node/app

ENV NODE_ENV production

COPY --from=builder --chown=node:node /home/node/app/dist .

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

RUN chown -R node:node /home/node/app

USER node

EXPOSE 3000

# Start the bot.
CMD ["node", "index.js"]