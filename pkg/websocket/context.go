package websocket

import (
	"Chatapp/pkg/database"
)

type Context struct {
	Ws    *Ws
	Event string
	Data  []byte
	Db    *database.Database
}

func (ctx *Context) Send(data []byte) {
	ctx.Ws.Write(data)
}
