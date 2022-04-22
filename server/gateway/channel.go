package gateway

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"
)

func ChannelCreate(ctx *websocket.Context) {
	var request request.Channel
	err := json.Unmarshal(ctx.Data, &request)

	if err != nil || request.Name == "" {
		return
	}

	channel := database.CreateChannel(request.Name, request.Icon, ctx.Ws.User, ctx.Db)
	response := response.NewChannel(channel)

	ws_msg := websocket.WS_Message{
		Event: "CHANNEL_CREATE",
		Data:  response,
	}

	res, _ := json.Marshal(ws_msg)
	ctx.Send(res)
}

func ChannelModify(ctx *websocket.Context) {
	var channel_req websocket.Channel
	json.Unmarshal(ctx.Data, &channel_req)

	if channel_req.Name == "" && channel_req.Icon == "" {
		return
	}

	channel, statusCode := database.ModifyChannel(channel_req.Uuid, channel_req.Name, channel_req.Icon, ctx.Ws.User, ctx.Db)
	if statusCode != http.StatusOK {
		return
	}

	res_channel := response.NewChannel(channel)
	websocket.BroadcastToChannel(ctx.Ws.Conns, res_channel.Uuid, "CHANNEL_MODIFY", res_channel)
}

func ChannelDelete(ctx *websocket.Context) {
	var channel_req websocket.Channel
	json.Unmarshal(ctx.Data, &channel_req)

	if channel_req.Uuid == "" {
		return
	}

	channel, member, statusCode := database.DeleteChannel(channel_req.Uuid, ctx.Ws.User, ctx.Db)
	if statusCode != http.StatusOK {
		return
	}
	res_channel := response.NewChannel(channel)
	res_member_user := response.NewUser(ctx.Ws.User, 0)
	res_member := response.NewMember(&res_member_user, channel, member)

	ws_msg_user := websocket.WS_Message{
		Event: "CHANNEL_DELETE",
		Data:  res_channel,
	}
	res, _ := json.Marshal(ws_msg_user)
	ctx.Send(res)

	websocket.BroadcastToChannel(ctx.Ws.Conns, channel.Uuid, "MEMBER_REMOVE", res_member)
}

func ChannelJoin(ctx *websocket.Context) {}
