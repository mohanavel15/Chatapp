package websocket

import "Chatapp/pkg/response"

type Connect struct {
	Token string
}

type WS_Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

type Ready struct {
	User         response.User           `json:"user"`
	Channels     []response.Channel      `json:"channels"`
	Relationship []response.Relationship `json:"relationship"`
}
