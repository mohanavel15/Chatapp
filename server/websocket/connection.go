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

func (conns *Connections) SendToUser(user_id string, event string, data interface{}) {
	ws_message := WS_Message{
		Event: event,
		Data:  data,
	}
	res, _ := json.Marshal(ws_message)

	if ws_conn, ok := conns.Users[user_id]; ok {
		ws_conn.Write(res)
	}
}

func (conns *Connections) AddUserToChannel(user_id string, channel_id string, ws *Ws) {
	if _, ok := conns.Channels[channel_id]; !ok {
		conns.Channels[channel_id] = make(map[string]*Ws)
	}
	conns.Channels[channel_id][user_id] = conns.Users[user_id]
}

func (conns *Connections) RemoveUserFromChannel(user_id string, channel_id string) {
	if _, ok := conns.Channels[channel_id]; !ok {
		return
	}
	if _, ok := conns.Channels[channel_id][user_id]; !ok {
		return
	}
	delete(conns.Channels[channel_id], user_id)
}

func (conns *Connections) GetUserStatus(user_id string) int {
	if _, ok := conns.Users[user_id]; ok {
		return 1
	}
	return 0
}
