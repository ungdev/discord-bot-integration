FROM node:alpine AS builder

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./
COPY --chown=nodejs:nodejs package.json .

RUN touch logs.txt
RUN touch storage.json

RUN chown -R nodejs:nodejs /app

RUN npm install --omit=dev

USER nodejs

EXPOSE 3000

# Start the bot.
CMD ["node", "index.js"]