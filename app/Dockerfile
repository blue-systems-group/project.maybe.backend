FROM node:0.10.40
MAINTAINER xcv58 <i@xcv58.com>
ONBUILD WORKDIR /appsrc
ONBUILD COPY . /appsrc

ONBUILD RUN curl https://install.meteor.com/ | sh && \
    meteor build ../app --directory --architecture os.linux.x86_64 && \
    rm -rf /appsrc
# TODO rm meteor so it doesn't take space in the image?

ONBUILD WORKDIR /app/bundle

ONBUILD RUN (cd programs/server && npm install)
EXPOSE 8080
CMD []
ENV PORT 8080
ENTRYPOINT MONGO_URL=$MONGO_SERVICE_URL /usr/local/bin/node main.js
ENV ROOT_URL http://maybe.xcv58.com
