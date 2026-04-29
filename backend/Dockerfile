# Używamy najnowszej stabilnej wersji Node.js
FROM node:18-alpine

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy package.json i package-lock.json
COPY package*.json ./

# Instalujemy zależności produkcyjne
RUN npm ci --only=production

# Kopiujemy cały kod aplikacji do kontenera
COPY . .

# Kompilujemy kod TypeScript
RUN npm run build

# Otwieramy port (Render automatycznie ustawi zmienną PORT)
EXPOSE 3000

# Uruchamiamy aplikację w trybie produkcyjnym
CMD ["npm", "run", "start:prod"]
