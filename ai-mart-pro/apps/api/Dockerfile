FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
ENV NODE_ENV=development
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node src/server.js"]
