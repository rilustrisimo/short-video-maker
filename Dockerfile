FROM ubuntu:22.04 AS install-whisper
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update
# whisper install dependencies
RUN apt install -y \
    git \
    build-essential \
    wget \
    cmake \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /whisper
RUN git clone https://github.com/ggml-org/whisper.cpp.git .
RUN git checkout v1.7.1
RUN make
WORKDIR /whisper/models
RUN sh ./download-ggml-model.sh tiny.en

FROM node:22-bookworm-slim AS base
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app
RUN apt update
RUN apt install -y \
      # whisper dependencies
      git \
      wget \
      cmake \
      ffmpeg \
      curl \
      make \
      libsdl2-dev \
      # remotion dependencies
      libnss3 \
      libdbus-1-3 \
      libatk1.0-0 \
      libgbm-dev \
      libasound2 \
      libxrandr2 \
      libxkbcommon-dev \
      libxfixes3 \
      libxcomposite1 \
      libxdamage1 \
      libatk-bridge2.0-0 \
      libpango-1.0-0 \
      libcairo2 \
      libcups2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS prod-deps
COPY package.json /app/package.json
COPY pnpm-lock.yaml* /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm install --prefer-offline --no-cache --prod

FROM prod-deps AS build
COPY tsconfig.json /app
COPY tsconfig.build.json /app
COPY vite.config.ts /app
COPY src /app/src
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM base
COPY static /app/static
COPY --from=install-whisper /whisper /app/data/libs/whisper
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY package.json /app/package.json

# app configuration via environment variables
ENV DATA_DIR_PATH=/app/data
ENV DOCKER=true
ENV WHISPER_MODEL=tiny.en
ENV KOKORO_MODEL_PRECISION=q4
# Reduce concurrency for free tier memory limits
ENV CONCURRENCY=1
# Reduce video cache for free tier - 200MB instead of 2GB
ENV VIDEO_CACHE_SIZE_IN_BYTES=209715200
# Node.js memory optimization
ENV NODE_OPTIONS="--max-old-space-size=400"

# install kokoro, headless chrome and ensure music files are present
RUN node dist/scripts/install.js

# Copy and set up start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Set working directory and expose port
WORKDIR /app
EXPOSE 10000

# Use the start script
CMD ["/bin/bash", "/app/start.sh"]
