package websocket

import "go.mongodb.org/mongo-driver/mongo"

type Context struct {
	Ws    *Ws
	Event string
	Data  []byte
	Raw   []byte
	Db    *mongo.Database
}

func (ctx *Context) Send(data []byte) {
	ctx.Ws.Write(data)
}
