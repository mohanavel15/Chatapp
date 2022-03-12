package websocket

import "gorm.io/gorm"

type Context struct {
	Ws    *Ws
	Event string
	Data  []byte
	Db    *gorm.DB
}

func (ctx *Context) Send(data []byte) error {
	return ctx.Ws.Write(data)
}

func (ctx *Context) Broadcast(ws_msg WS_Message) {
	ctx.Ws.Conns.Queue = append(ctx.Ws.Conns.Queue, &ws_msg)
}
