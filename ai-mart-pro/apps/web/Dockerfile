FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
ARG API_REWRITE_TARGET=http://api:4000
ENV API_REWRITE_TARGET=$API_REWRITE_TARGET
ENV NEXT_PUBLIC_API_URL=/backend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
