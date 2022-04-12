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

	channel := database.Channel{
		Uuid: call_start.ChannelID,
	}
	ctx.Db.First(&channel)

	if channel.ID == 0 {
		return
	}

	members := database.Member{
		ChannelID: channel.ID,
		AccountID: ctx.Ws.User.ID,
	}

	ctx.Db.First(&members)

	if members.ID == 0 {
		return
	}

	_, ok := ctx.Ws.Conns.Calls[channel.Uuid]
	if !ok {
		ctx.Ws.Conns.Calls[channel.Uuid] = make(map[string]*websocket.Call)
	}
	ctx.Ws.Conns.Calls[channel.Uuid][ctx.Ws.User.Uuid] = &websocket.Call{
		Ws: ctx.Ws,
		Sdp: &websocket.SDP{
			Type: call_start.Sdp.Type,
			Sdp:  call_start.Sdp.Sdp,
		},
	}

	if users, ok := ctx.Ws.Conns.Channels[channel.Uuid]; ok {
		for _, user := range users {
			if user.User.Uuid != ctx.Ws.User.Uuid {
				user.Write(ctx.Raw)
			}
		}
	}
}
