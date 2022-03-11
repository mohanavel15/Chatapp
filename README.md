# Chatapp

## Setup Server

In server folder

### Example `.env`

```bash
export SERVER_HOST="127.0.0.1"
export SERVER_PORT="5000"
export JWT_SECRET="some_random_string"
export PG_HOST="127.0.0.1"
export PG_PORT="5432"
export PG_USER="database_username"
export PG_PASSWORD="database_password"
export PG_DATABASE="chatapp"
```

### Run Server

```bash
make build
make run
```

OR

```bash
go build
source .env
./Chatapp
```

### Server Dependency

```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
go get -u github.com/google/uuid
go get -u github.com/gorilla/mux
go get -u github.com/gorilla/websocket
go get -u github.com/gorilla/handlers
go get -u golang.org/x/crypto/bcrypt
go get -u github.com/golang-jwt/jwt
```

## Setup Database
### Postgres Databse Docker
```bash
docker-compose up -d
```

## Setup Web Client

In web folder

### Web Client Dependency

```bash
npm install react-router-dom
npm install emoji-picker-react
npm install axios
npm install websocket
npm install prop-types
npm install @fortawesome/fontawesome-svg-core
npm install @fortawesome/free-solid-svg-icons
npm install @fortawesome/react-fontawesome
```

### Run Web Client

```bash
npm start
```
