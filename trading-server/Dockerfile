FROM node:20

# tzdata 설치 (Debian/Ubuntu 계열)
RUN apt-get update && apt-get install -y tzdata

# 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

WORKDIR /Trading-server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
