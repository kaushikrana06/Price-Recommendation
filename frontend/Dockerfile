# Build & hold container (produces /app/dist and then idles)
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
# Keep the container up so nginx can mount /app/dist from the host
CMD ["sh", "-c", "tail -f /dev/null"]
