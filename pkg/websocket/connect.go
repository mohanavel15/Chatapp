package websocket

import (
	"Chatapp/pkg/response"
	"Chatapp/pkg/utils"
	"encoding/json"
	"log"
	"net/http"
)

func ConnectUser(ctx *Context) {
	data := ctx.Data

	var connect_req Connect
	err := json.Unmarshal(data, &connect_req)
	if err != nil {
		return
	}

	token := connect_req.Token
	if token == "" {
		return
	}

	is_valid, session := utils.ValidateAccessToken(token, ctx.Db.Mongo)
	if !is_valid {
		ws_message := WS_Message{
			Event: "INVAILD_SESSION",
		}
		res, _ := json.Marshal(ws_message)
		ctx.Ws.Write(res)
		return
	}

	get_user, statusCode := ctx.Db.GetUser(session.AccountID.Hex())
	if statusCode != http.StatusOK {
		return
	}

	res_user := response.NewUser(get_user, 1)

	ctx.Ws.User = get_user
	log.Printf("%s joined", ctx.Ws.User.Username)
	ctx.Ws.Conns.AddUser(get_user.ID.Hex(), ctx.Ws)

	res_channels := response.Channels{}
	channels := ctx.Db.GetChannels(get_user)
	for _, channel := range channels {
		recipients := []response.User{}
		for _, recipient := range channel.Recipients {
			if channel.Type == 1 && recipient.Hex() == get_user.ID.Hex() {
				continue
			}
			recipient, _ := ctx.Db.GetUser(recipient.Hex())
			recipients = append(recipients, response.NewUser(recipient, ctx.Ws.Conns.GetUserStatus(recipient.ID.Hex())))
		}
		res_channels = append(res_channels, response.NewChannel(&channel, recipients))

		status := response.Status{
			UserID:    get_user.ID.Hex(),
			Status:    1,
			Type:      1,
			ChannelID: channel.ID.Hex(),
		}
		ctx.Ws.Conns.BroadcastToChannel(channel.ID.Hex(), "STATUS_UPDATE", status)
		ctx.Ws.Conns.AddUserToChannel(get_user.ID.Hex(), channel.ID.Hex())
	}

	relationships := ctx.Db.GetRelationships(get_user.ID)
	for _, relationship := range relationships {
		if relationship.Type != 1 {
			continue
		}
		status := response.Status{
			UserID: get_user.ID.Hex(),
			Status: 1,
			Type:   0,
		}
		ctx.Ws.Conns.SendToUser(relationship.ToUserID.Hex(), "STATUS_UPDATE", status)
	}

	ws_msg := WS_Message{
		Event: "READY",
		Data: Ready{
			User:     res_user,
			Channels: res_channels,
		},
	}

	ws_res, _ := json.Marshal(ws_msg)
	ctx.Send(ws_res)
}
