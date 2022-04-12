package gateway

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

func ChannelCreate(ctx *websocket.Context) {
	var request request.Channel
	err := json.Unmarshal(ctx.Data, &request)

	if err != nil {
		return
	}

	if request.Name == "" {
		return
	}

	channel := database.Channel{
		Uuid:      uuid.New().String(),
		Name:      request.Name,
		Icon:      request.Icon,
		Owner:     ctx.Ws.User.Uuid,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	ctx.Db.Create(&channel)

	members := database.Member{
		ChannelID: channel.ID,
		AccountID: ctx.Ws.User.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	ctx.Db.Create(&members)

	response := response.Channel{
		Uuid:      channel.Uuid,
		Name:      channel.Name,
		Icon:      channel.Icon,
		OwnerID:   ctx.Ws.User.Uuid,
		CreatedAt: channel.CreatedAt.String(),
		UpdatedAt: channel.UpdatedAt.String(),
	}

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

	var channel database.Channel
	ctx.Db.Where("uuid = ?", channel_req.Uuid).First(&channel)

	if channel.ID == 0 {
		return
	}

	if channel.Owner != ctx.Ws.User.Uuid {
		return
	}

	if channel_req.Name != "" {
		channel.Name = channel_req.Name
	}
	if channel_req.Icon != "" {
		channel.Icon = channel_req.Icon
	}
	channel.UpdatedAt = time.Now()
	ctx.Db.Save(&channel)

	res_channel := response.Channel{
		Uuid:      channel.Uuid,
		Name:      channel.Name,
		Icon:      channel.Icon,
		OwnerID:   channel.Owner,
		CreatedAt: channel.CreatedAt.String(),
		UpdatedAt: channel.UpdatedAt.String(),
	}

	ws_msg := websocket.WS_Message{
		Event: "CHANNEL_MODIFY",
		Data:  res_channel,
	}

	ctx.Broadcast(ws_msg)
}

func ChannelDelete(ctx *websocket.Context) {
	var channel_req websocket.Channel
	json.Unmarshal(ctx.Data, &channel_req)

	if channel_req.Uuid == "" {
		return
	}

	var channel database.Channel
	ctx.Db.Where("uuid = ?", channel_req.Uuid).First(&channel)

	if channel.ID == 0 {
		return
	}

	var member database.Member
	ctx.Db.Where("channel_id = ? AND account_id = ?", channel.ID, ctx.Ws.User.ID).First(&member)

	if member.ID == 0 {
		return
	}

	ctx.Db.Delete(&member)

	res_channel := response.Channel{
		Uuid:      channel.Uuid,
		Name:      channel.Name,
		Icon:      channel.Icon,
		OwnerID:   channel.Owner,
		CreatedAt: channel.CreatedAt.String(),
		UpdatedAt: channel.UpdatedAt.String(),
	}

	ws_msg_user := websocket.WS_Message{
		Event: "CHANNEL_DELETE",
		Data:  res_channel,
	}

	res, _ := json.Marshal(ws_msg_user)

	ctx.Send(res)

	res_member := response.Member{
		Uuid:      ctx.Ws.User.Uuid,
		Username:  ctx.Ws.User.Username,
		Avatar:    ctx.Ws.User.Avatar,
		Is_Owner:  channel.Owner == ctx.Ws.User.Uuid,
		Status:    1,
		ChannelID: channel.Uuid,
		CreatedAt: ctx.Ws.User.CreatedAt.String(),
		JoinedAt:  member.CreatedAt.String(),
	}

	ws_msg := websocket.WS_Message{
		Event: "MEMBER_REMOVE",
		Data:  res_member,
	}

	ws_res, _ := json.Marshal(ws_msg)
	if members, ok := ctx.Ws.Conns.Channels[channel.Uuid]; ok {
		for _, member := range members {
			member.Write(ws_res)
		}
	}
}

func ChannelJoin(ctx *websocket.Context) {}
