package websocket

import (
	"encoding/json"
	"sync"
)

type Connections struct {
	mutex    sync.Mutex
	users    map[string]*Ws
	channels map[string]map[string]*Ws
}

func NewConnections() *Connections {
	return &Connections{
		channels: make(map[string]map[string]*Ws),
		users:    make(map[string]*Ws),
	}
}

func (conns *Connections) AddUser(user_id string, ws *Ws) {
	conns.mutex.Lock()
	conns.users[user_id] = ws
	conns.mutex.Unlock()
}

func (conns *Connections) RemoveUser(user_id string) {
	conns.mutex.Lock()
	if _, ok := conns.users[user_id]; !ok {
		conns.mutex.Unlock()
		return
	}

	delete(conns.users, user_id)
	conns.mutex.Unlock()
}

func (conns *Connections) GetUserStatus(user_id string) int {
	conns.mutex.Lock()
	if _, ok := conns.users[user_id]; ok {
		conns.mutex.Unlock()
		return 1
	}
	conns.mutex.Unlock()
	return 0
}

func (conns *Connections) SendToUser(user_id string, event string, data interface{}) {
	conns.mutex.Lock()
	ws_message := WS_Message{
		Event: event,
		Data:  data,
	}
	res, _ := json.Marshal(ws_message)

	if ws_conn, ok := conns.users[user_id]; ok {
		ws_conn.Write(res)
	}
	conns.mutex.Unlock()
}

func (conns *Connections) AddUserToChannel(user_id string, channel_id string) {
	conns.mutex.Lock()
	if _, ok := conns.channels[channel_id]; !ok {
		conns.channels[channel_id] = make(map[string]*Ws)
	}

	if user, ok := conns.users[user_id]; ok {
		conns.channels[channel_id][user_id] = user
	}
	conns.mutex.Unlock()
}

func (conns *Connections) RemoveUserFromChannel(user_id string, channel_id string) {
	conns.mutex.Lock()
	if _, ok := conns.channels[channel_id]; !ok {
		conns.mutex.Unlock()
		return
	}
	if _, ok := conns.channels[channel_id][user_id]; !ok {
		conns.mutex.Unlock()
		return
	}
	delete(conns.channels[channel_id], user_id)
	conns.mutex.Unlock()
}

func (conns *Connections) BroadcastToChannel(channel_id string, event string, data interface{}) {
	conns.mutex.Lock()
	ws_message := WS_Message{
		Event: event,
		Data:  data,
	}
	res, _ := json.Marshal(ws_message)

	if channel, ok := conns.channels[channel_id]; ok {
		for _, ws_conn := range channel {
			ws_conn.Write(res)
		}
	}
	conns.mutex.Unlock()
}
