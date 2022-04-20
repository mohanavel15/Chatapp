package websocket

import "gorm.io/gorm"

type Context struct {
	Ws    *Ws
	Event string
	Data  []byte
	Raw   []byte
	Db    *gorm.DB
}

func (ctx *Context) Send(data []byte) error {
	return ctx.Ws.Write(data)
}
