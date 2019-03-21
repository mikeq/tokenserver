FROM keymetrics/pm2:latest-alpine

WORKDIR /cli

COPY package.json yarn.lock /cli/

RUN yarn

COPY . /cli

EXPOSE 3005

ENTRYPOINT [ "pm2-runtime", "start", "pm2.json" ]
