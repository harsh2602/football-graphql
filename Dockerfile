# Build Stage
FROM node:12.18.0-stretch AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Runtime Stage
FROM alpine:3.12
RUN apk add --update nodejs
RUN addgroup -S node && adduser -S node -G node
USER node
RUN mkdir /home/node/src
WORKDIR /home/node/src
COPY --from=build --chown=node:node /build .
CMD ["node", "./api/server.js"]