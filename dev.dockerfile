FROM node:12.18.0-stretch

RUN npm i -g nodemon

USER node

RUN mkdir /home/node/src

WORKDIR /home/node/src

COPY --chown=node:node package-lock.json package.json ./

RUN npm ci

COPY --chown=node:node . .

CMD ["nodemon", "./api/server.js"]