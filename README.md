# Chatapp

![friends_all](images/friends-all.png)
![channel_png](images/channel.png)
more [images](images)

## Features
- Authentication
- Messages
    - Create
    - Edit
    - Delete
- DMs
- Channel
    - Owner can delete other user's message
    - Create / Delete invites
    - Kick / Ban Member
    - Unban
- Friends
	- Add / Accept
	- Remove / Decline
- Block / Unblock Users

## Setup Server

In server folder

### Example `.env`

```bash
export SERVER_HOST="0.0.0.0"
export SERVER_PORT="5000"
export JWT_SECRET="some_random_string"
export MONGO_URI="mongodb://username:password@host:27017"
export MONGO_DATABASE="database"
```

### Run Server

```bash
go build
source .env
./Chatapp
```

### Server Dependency

```bash
go get .
```

## Setup Database
### Postgres Database Docker
```bash
docker-compose up -d
```

## Setup Web Client

In web folder

### Web Client Dependency

```bash
npm ci
```

### Run Web Client

```bash
npm start
```
