# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.0.15-slim
WORKDIR /usr/src/app

ADD . /usr/src/app

ENV NODE_ENV=production
RUN bun build frontend/src/index.ts --outdir frontend/public/

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "backend/src/index.ts"]
