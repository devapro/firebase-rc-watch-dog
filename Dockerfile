FROM node
WORKDIR /app/firebase-rc-watch-dog
COPY ./ ./
RUN npm install
CMD ["nodejs", "./index.js"]
