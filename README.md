# Chatapp

![channel_png](images/channel.png)
![relationship-online](images/relationship-online.png)


## Features
- [x] Full Responsive UI
- [x] PWA
- [ ] Push Notification 

### Example `.env`

```bash
export SERVER_HOST="0.0.0.0"
export SERVER_PORT="5000"
export PUBLIC_HOST="localhost:5000" # Change to the ip or domain used.
export TLS="" # "" for http & "s" for https.
export JWT_SECRET="YOUR-JWT-SECRET"
export MONGO_URI="mongodb://USERNAME:PASSWORD@HOST:27017"
export MONGO_DATABASE="DATABASE_NAME"
export SMTP_SERVER="SMTP_SERVER" # e.g smtp.gmail.com
export SMTP_USERNAME="USERNAME"
export SMTP_PASSWORD="PASSWORD"
```

### To Build & Run Chatapp
```bash
docker-compose up -d mongodb # For database
cd web
pnpm i
pnpm build
cd ..
go get .
go build
source .env
./Chatapp
```

## Deploy on Docker
- change environment variables before running
```bash
cp docker-compose.example.yml docker-compose.yml
docker-compose up -d
```