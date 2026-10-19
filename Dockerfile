# Docket doküman asistanı sunucusu (Express). Arayüz statik olduğundan ayrıca yayınlanır (bkz. DEPLOY.md).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
EXPOSE 3000
CMD ["node", "server/index.js"]
