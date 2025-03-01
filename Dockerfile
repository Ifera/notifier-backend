FROM node:20.4.0-alpine
# RUN addgroup app && adduser -S -G app app 
# USER app
WORKDIR /app
# RUN chown -R app:app /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "prod"]