package websocket

import (
	"Chatapp/server/database"
)

type Context struct {
	Ws    *Ws
	Event string
	Data  interface{}
	Db    *database.Database
}

func (ctx *Context) Send(data []byte) {
	ctx.Ws.Write(data)
}
