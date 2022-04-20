package websocket

import "Chatapp/response"

type Connect struct {
	Token string
}

type WS_Message struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

type Message struct {
	Content string `json:"content"`
	Channel string `json:"channel"`
}

type MessageDelete struct {
	Uuid string `json:"uuid"`
}

type MessageEdit struct {
	Uuid    string `json:"uuid"`
	Content string `json:"content"`
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
	User       response.User        `json:"user"`
	DMChannels []response.DMChannel `json:"dm_channels"`
	Channels   []response.Channel   `json:"channels"`
	Friends    []response.Friend    `json:"friends"`
}
