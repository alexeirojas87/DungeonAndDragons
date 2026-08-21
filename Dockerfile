# ============================================================
# The Gauntlet — production image
# Stage 1 installs + builds with pnpm; stage 2 is a lean runtime.
# `Assests/` must live in the runtime WORKDIR because /api/asset
# resolves it relative to process.cwd().
# ============================================================

# ---- Build ----
FROM node:22-alpine AS builder
# Install pnpm directly via npm: `corepack prepare --activate` only stages the
# shim and does not put `pnpm` on PATH in the non-interactive build shell
# (classic "pnpm: not found"). npm -g always lands in node's bin dir (on PATH).
RUN npm install -g pnpm@11.21.0

WORKDIR /app

# Lockfile + manifest first for layers that stay cacheable.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Source + data the build touches.
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- Runtime ----
FROM node:22-alpine AS runner
RUN npm install -g pnpm@11.21.0 && addgroup -S nodejs && adduser -S nextjs -G nodejs
ENV NODE_ENV=production
WORKDIR /app

# Reinstall the exact frozen dependency tree in the runtime image. The builder
# cannot ship node_modules to us (it is dockerignored), and a fresh --prod
# install keeps the runtime clean of build-only devDependencies. pnpm's
# store lives inside the runtime now, so the tree is self-contained.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/Assests ./Assests
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["pnpm", "start"]