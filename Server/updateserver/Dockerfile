FROM node:20

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Asia/Seoul
RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

WORKDIR /updateserver

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4001
CMD ["npm", "run", "start:dev"]