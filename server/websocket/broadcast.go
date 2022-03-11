package websocket

import (
	"Chatapp/response"
	"encoding/json"
)

func BroadcastMessage(ws *Ws, ws_msg WS_Message) {
	data := ws_msg.Data

	byte_data, _ := json.Marshal(data)
	byte_ws_msg, _ := json.Marshal(ws_msg)

	var message response.Message
	json.Unmarshal(byte_data, &message)

	channel_uuid := message.Channel.Uuid
	if channel, ok := ws.Conns.Channels[channel_uuid]; ok {
		for _, ws_conn := range channel {
			ws_conn.Write(byte_ws_msg)
		}
	}
}
