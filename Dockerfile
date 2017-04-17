FROM node:6.10
RUN apt-get -y update && apt-get install -y imagemagick && rm -rf /var/lib/apt/lists/*
COPY package.json index.js deployToS3.js node_modules /tile-web-runner/
WORKDIR /tile-web-runner
# RUN npm install
CMD npm start