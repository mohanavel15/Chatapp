package websocket

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
	Uuid string `json:"content"`
}

type MessageEdit struct {
	Uuid    string `json:"uuid"`
	Content string `json:"content"`
}

type Connections struct {
	Queue    []*WS_Message
	Users    map[string]*Ws
	Channels map[string][]*Ws
}

type Channel struct {
	Uuid string `json:"uuid"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}
