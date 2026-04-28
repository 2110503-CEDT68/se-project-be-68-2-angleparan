FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# ใช้ ci เพื่อความเป๊ะของ version library และตัด devDependencies ออก
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
# ปรับเป็นพอร์ต 5000 ตามโค้ด server.js ของคุณ
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]