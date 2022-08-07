package main

import (
	"log"
	"net/http"

	ws "Chatapp/websocket"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func Gateway(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println(err)
		return
	}

	ws := &ws.Ws{
		Conn:    conn,
		Handler: handler,
		Db:      db,
		Conns:   conns,
	}

	ws.ReadLoop()
}
