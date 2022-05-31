package websocket

import (
	"Chatapp/database"
	"Chatapp/response"
)

func Disconnect(ws *Ws) {
	if ws.User == nil {
		ws.Close()
	}

	channels := database.GetChannels(ws.User, ws.Db)
	for _, channel := range channels {
		status := response.Status{
			UserID:    ws.User.ID.Hex(),
			Status:    0,
			Type:      1,
			ChannelID: channel.ID.Hex(),
		}
		ws.Conns.BroadcastToChannel(channel.ID.Hex(), "STATUS_UPDATE", status)
	}

	delete(ws.Conns.Users, ws.User.ID.Hex())
	ws.Close()
	return
}
