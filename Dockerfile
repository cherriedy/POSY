# FROM node:18
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
# EXPOSE 3000 50051
# CMD ["node", "dist/main.js"]
