package request

import "Chatapp/websocket"

type CallStart struct {
	ChannelID string        `json:"channel_id"`
	Sdp       websocket.SDP `json:"sdp"`
}
