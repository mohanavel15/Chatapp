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

	channel_uuid := message.ChannelID
	if channel, ok := ws.Conns.Channels[channel_uuid]; ok {
		for _, ws_conn := range channel {
			ws_conn.Write(byte_ws_msg)
		}
	}
}

func BroadcastToChannel(conns *Connections, channel_id string, event string, data interface{}) {
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
