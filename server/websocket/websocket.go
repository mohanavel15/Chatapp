package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"Chatapp/database"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type Ws struct {
	Uuid    string
	Conn    *websocket.Conn
	Handler *EventHandler
	Db      *gorm.DB
	User    *database.Account
	Conns   *Connections
}

func (ws *Ws) Write(data []byte) error {
	return ws.Conn.WriteMessage(websocket.TextMessage, data)
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
			if ws.User != nil {
				delete(ws.Conns.Users, ws.User.Uuid)
			}
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

func (ws *Ws) HandleQueue() {
	for {
		if len(ws.Conns.Queue) > 0 {
			for _, ws_message := range ws.Conns.Queue {
				switch ws_message.Event {
				case "MESSAGE_CREATE":
					BroadcastMessage(ws, *ws_message)
				case "MESSAGE_MODIFY":
					BroadcastMessage(ws, *ws_message)
				case "MESSAGE_DELETE":
					BroadcastMessage(ws, *ws_message)
				case "CHANNEL_MODIFY":
					BroadcastChannel(ws, *ws_message)
				}
				ws.Conns.Queue = ws.Conns.Queue[1:]
			}
		}
		time.Sleep(time.Millisecond)
	}
}

func (ws *Ws) Close() {
	ws.Conn.Close()
}
