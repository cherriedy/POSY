# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy workspace config
COPY tsconfig.base.json nx.json ./
COPY prisma.config.js prisma.config.ts ./

# Copy source
COPY apps/api/    apps/api/
COPY libs/        libs/

# Copy prisma schema and generate client
COPY apps/api/src/database/schema.prisma apps/api/src/database/schema.prisma
RUN npx prisma generate --schema=apps/api/src/database/schema.prisma

# Build the api app
RUN npx nx build api

# ── Stage 2: runner ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output
COPY --from=builder /app/dist/apps/api ./dist/apps/api

# Copy mail templates (watched assets — not compiled by tsc)
COPY apps/api/src/mails/templates ./dist/apps/api/mails/templates

# Copy prisma schema + generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY apps/api/src/database/schema.prisma ./apps/api/src/database/schema.prisma

EXPOSE 3000

CMD ["node", "dist/apps/api/main"]
