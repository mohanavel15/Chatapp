package websocket

import (
	"encoding/json"
)

type Connections struct {
	Users    map[string]*Ws
	Channels map[string]map[string]*Ws
}

func (conns *Connections) BroadcastToChannel(channel_id string, event string, data interface{}) {
	ws_message := WS_Message{
		Event: event,
		Data:  data,
	}
	res, _ := json.Marshal(ws_message)

	if channel, ok := conns.Channels[channel_id]; ok {
		for _, ws_conn := range channel {
			ws_conn.Write(res)
		}
	}
}
