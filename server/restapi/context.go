package restapi

import (
	"Chatapp/database"
	"Chatapp/websocket"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"
)

type Context struct {
	Res  http.ResponseWriter
	Req  *http.Request
	Db   *mongo.Database
	User database.User
	Conn *websocket.Connections
}
