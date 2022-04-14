package gateway

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/websocket"
	"encoding/json"
)

func CallStart(ctx *websocket.Context) {
	var call_start request.CallStart
	err := json.Unmarshal(ctx.Data, &call_start)
	if err != nil {
		return
	}

	if call_start.ChannelID == "" {
		return
	}

	channel := database.DMChannel{
		Uuid: call_start.ChannelID,
	}
	ctx.Db.First(&channel)

	if channel.ID == 0 {
		return
	}

	if channel.FromUser != ctx.Ws.User.ID && channel.ToUser != ctx.Ws.User.ID {
		return
	}

	var get_user2 database.Account
	if channel.FromUser != ctx.Ws.User.ID {
		ctx.Db.Where("id = ?", channel.FromUser).First(&get_user2)
	} else {
		ctx.Db.Where("id = ?", channel.ToUser).First(&get_user2)
	}

	if get_user2.ID == 0 {
		return
	}

	if user2, ok := ctx.Ws.Conns.Users[get_user2.Uuid]; ok {
		user2.Write(ctx.Raw)
	}
}
