FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .

EXPOSE 5173

CMD ["npx", "vite", "preview", "--host", "--port", "5173"]