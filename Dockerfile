# Gunakan image resmi Node.js sebagai base image
FROM node:20-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json terlebih dahulu
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file project ke dalam container
COPY . .

# Build project Next.js
RUN npm run build

# Ekspos port yang digunakan oleh Next.js
EXPOSE 3000

# Jalankan aplikasi Next.js dalam mode production
CMD ["npm", "start"]
