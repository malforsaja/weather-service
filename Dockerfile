FROM node:14.19.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

## Add application code
COPY . .

## Set environment to "development" by default
ENV NODE_ENV development

## Allows port 8080 to be publicly available
EXPOSE 8080

# Install our test framework - mocha
RUN npm install -g mocha

## The command uses nodemon to run the application test
CMD [ "mocha", "test/weather.test.js" ]