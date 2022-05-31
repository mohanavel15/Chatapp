package websocket

import "Chatapp/response"

type Connect struct {
	Token string
}

type WS_Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

type Connections struct {
	Users    map[string]*Ws
	Channels map[string]map[string]*Ws
}

type Channel struct {
	Uuid string `json:"uuid"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type Ready struct {
	User     response.User      `json:"user"`
	Channels []response.Channel `json:"channels"`
	Friends  []response.Friend  `json:"friends"`
}
