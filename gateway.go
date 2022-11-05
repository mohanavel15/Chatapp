package main

import (
	"log"
	"net/http"

	"Chatapp/pkg/restapi"
	ws "Chatapp/pkg/websocket"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Gateway(ctx *restapi.Context) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(ctx.Res, ctx.Req, nil)

	if err != nil {
		log.Println(err)
		conn.Close()
		return
	}

	ws := &ws.Ws{
		Conn:    conn,
		Handler: handler,
		Db:      db,
		User:    &ctx.User,
		Conns:   conns,
	}

	ws.ConnectUser()
	ws.ReadLoop()
}
