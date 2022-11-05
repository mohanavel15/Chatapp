package websocket

import (
	"Chatapp/pkg/database"
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
	if err != nil {
		return nil, err
	}
	return data, nil
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

	data_json, err := json.Marshal(ws_message.Data)
	if err != nil {
		fmt.Println(err)
	}

	ctx := Context{
		Ws:    ws,
		Event: strings.ToUpper(ws_message.Event),
		Data:  data_json,
		Db:    ws.Db,
	}

	if ws.User == nil {
		if ws_message.Event == "CONNECT" {
			ws.Handler.Handle(ctx)
		}
	} else {
		ws.Handler.Handle(ctx)
	}
}

func (ws *Ws) Close() {
	err := ws.Conn.Close()
	if err != nil {
		log.Println(err)
	}
}
