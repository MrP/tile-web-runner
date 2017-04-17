FROM node:6.10
RUN apt-get -y update && apt-get install -y imagemagick && rm -rf /var/lib/apt/lists/*
COPY package.json index.js deployToS3.js /tile-web-runner/
WORKDIR /tile-web-runner
RUN npm install
COPY index.js deployToS3.js /tile-web-runner/
CMD npm start