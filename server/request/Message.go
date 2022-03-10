package request

type Message struct {
	Content string `json:"content"`
}

type GatewayMessage struct {
	Content string `json:"content"`
	Channel string `json:"channel"`
}

type GatewayMessageDelete struct {
	Uuid string `json:"content"`
}

type GatewayMessageEdit struct {
	Uuid    string `json:"uuid"`
	Content string `json:"content"`
}
