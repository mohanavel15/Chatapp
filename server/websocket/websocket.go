package websocket

import (
	"Chatapp/server/database"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/gorilla/websocket"
)

type Ws struct {
	Conn    *websocket.Conn
	Handler *EventHandler
	Db      *database.Database
	User    *database.User
	Conns   *Connections
}

func (ws *Ws) Write(data []byte) {
	err := ws.Conn.WriteMessage(websocket.TextMessage, data)
	if err != nil {
		log.Println(err)
	}
}

func (ws *Ws) Read() ([]byte, error) {
	_, data, err := ws.Conn.ReadMessage()
	return data, err
}

func (ws *Ws) ReadLoop() {
	for {
		data, err := ws.Read()
		if err != nil {
			log.Println(err)
			ws.Disconnect()
			return
		}
		ws.HandleWSMessage(data)
	}
}

func (ws *Ws) HandleWSMessage(data []byte) {
	var ws_message WS_Message
	err := json.Unmarshal(data, &ws_message)
	if err != nil {
		fmt.Println(err)
	}

	ctx := Context{
		Ws:    ws,
		Event: strings.ToUpper(ws_message.Event),
		Data:  ws_message.Data,
		Db:    ws.Db,
	}

	ws.Handler.Handle(ctx)
}

func (ws *Ws) Close() {
	err := ws.Conn.Close()
	if err != nil {
		log.Println(err)
	}
}
