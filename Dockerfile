# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Start the bot.
CMD ["node", "dist/index.js"]