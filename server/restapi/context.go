package restapi

import (
	"Chatapp/database"
	"Chatapp/websocket"
	"net/http"

	"gorm.io/gorm"
)

type Context struct {
	Res  http.ResponseWriter
	Req  *http.Request
	Db   *gorm.DB
	User database.Account
	Conn *websocket.Connections
}
