package websocket

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/utils"
	"encoding/json"
	"fmt"
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

	is_valid, session := utils.ValidateAccessToken(token, ctx.Db)
	if is_valid != true {
		ws_message := WS_Message{
			Event: "INVAILD_SESSION",
		}
		res, _ := json.Marshal(ws_message)
		ctx.Ws.Write(res)
		return
	}

	get_user, statusCode := database.GetUser(session.AccountID.Hex(), ctx.Db)
	if statusCode != http.StatusOK {
		return
	}

	res_user := response.NewUser(get_user, 1)

	ctx.Ws.User = get_user
	log.Println(fmt.Sprintf("%s joined", ctx.Ws.User.Username))
	ctx.Ws.Conns.Users[get_user.ID.Hex()] = ctx.Ws

	res_channels := response.Channels{}
	channels := database.GetChannels(get_user, ctx.Db)
	for _, channel := range channels {
		recipients := []response.User{}
		for _, recipient := range channel.Recipients {
			if channel.Type == 1 && recipient.Hex() == get_user.ID.Hex() {
				continue
			}
			recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
			recipients = append(recipients, response.NewUser(recipient, 0))
		}
		res_channels = append(res_channels, response.NewChannel(&channel, recipients))

		status := response.Status{
			UserID:    get_user.ID.Hex(),
			Status:    0,
			Type:      1,
			ChannelID: channel.ID.Hex(),
		}
		ctx.Ws.Conns.BroadcastToChannel(channel.ID.Hex(), "STATUS_UPDATE", status)
		ctx.Ws.Conns.AddUserToChannel(get_user.ID.Hex(), channel.ID.Hex(), ctx.Ws)
	}

	ws_msg := WS_Message{
		Event: "READY",
		Data: Ready{
			User:     res_user,
			Channels: res_channels,
			Friends:  []response.Friend{},
		},
	}

	ws_res, _ := json.Marshal(ws_msg)
	ctx.Send(ws_res)
}
