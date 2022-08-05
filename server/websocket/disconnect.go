package websocket

import (
	"Chatapp/database"
	"Chatapp/response"
)

func Disconnect(ws *Ws) {
	if ws.User == nil {
		ws.Close()
		return
	}

	channels := database.GetChannels(ws.User, ws.Db)
	for _, channel := range channels {
		status := response.Status{
			UserID:    ws.User.ID.Hex(),
			Status:    0,
			Type:      1,
			ChannelID: channel.ID.Hex(),
		}
		ws.Conns.RemoveUserFromChannel(ws.User.ID.Hex(), channel.ID.Hex())
		ws.Conns.BroadcastToChannel(channel.ID.Hex(), "STATUS_UPDATE", status)
	}

	relationships := database.GetRelationships(ws.User.ID, ws.Db)
	for _, relationship := range relationships {
		status := response.Status{
			UserID: ws.User.ID.Hex(),
			Status: 0,
			Type:   0,
		}
		ws.Conns.SendToUser(relationship.ToUserID.Hex(), "STATUS_UPDATE", status)
	}

	delete(ws.Conns.Users, ws.User.ID.Hex())
	ws.Close()
}
