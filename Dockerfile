FROM node:latest

# Create the bot's directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install

COPY . /usr/src/bot

RUN npm run build

# Start the bot.
CMD ["node", "build/index.js"]