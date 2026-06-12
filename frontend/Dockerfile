# Simple Node.js production server for React/Vite frontend

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build React app
RUN pnpm build

EXPOSE 3000

CMD ["node", "server.js"]
