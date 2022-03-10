package gateway

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

func MessageCreate(ctx *websocket.Context) {
	raw_message := ctx.Data

	var message websocket.Message
	err := json.Unmarshal([]byte(raw_message), &message)
	if err != nil {
		return
	}

	if message.Content == "" || message.Channel == "" {
		return
	}

	get_channel := database.Channel{
		Uuid: message.Channel,
	}

	ctx.Db.Where(&get_channel).First(&get_channel)

	if get_channel.ID == 0 {
		return
	}

	member := database.Member{
		ChannelID: get_channel.ID,
		AccountID: ctx.Ws.User.ID,
	}

	ctx.Db.Where(&member).First(&member)

	if member.ID == 0 {
		return
	}

	new_message := database.Message{
		Uuid:      uuid.New().String(),
		Content:   message.Content,
		ChannelID: get_channel.ID,
		AccountID: ctx.Ws.User.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	ctx.Db.Create(&new_message)

	author := response.User{
		Uuid:      ctx.Ws.User.Uuid,
		Avatar:    ctx.Ws.User.Avatar,
		Username:  ctx.Ws.User.Username,
		CreatedAt: ctx.Ws.User.CreatedAt.String(),
		UpdatedAt: ctx.Ws.User.UpdatedAt.String(),
	}

	channel_res := response.Channel{
		Uuid:           get_channel.Uuid,
		Name:           get_channel.Name,
		Icon:           get_channel.Icon,
		OwnerID:        get_channel.Owner,
		PrivateChannel: get_channel.PrivateChannel,
		CreatedAt:      get_channel.CreatedAt.String(),
		UpdatedAt:      get_channel.UpdatedAt.String(),
	}

	message_res := response.Message{
		Uuid:      new_message.Uuid,
		Content:   new_message.Content,
		Author:    author,
		Channel:   channel_res,
		CreatedAt: new_message.CreatedAt.String(),
		EditedAt:  new_message.UpdatedAt.String(),
	}

	ws_msg := websocket.WS_Message{
		Event: "MESSAGE_CREATE",
		Data:  message_res,
	}

	ws_msg_json, err := json.Marshal(ws_msg)
	if err != nil {
		return
	}

	ctx.Send(ws_msg_json)
}

func MessageModify(ctx *websocket.Context) {
	data := ctx.Data

	var message websocket.MessageEdit
	err := json.Unmarshal(data, &message)
	if err != nil {
		return
	}

	if message.Uuid == "" || message.Content == "" {
		return
	}

	get_message := database.Message{
		Uuid: message.Uuid,
	}

	if get_message.ID == 0 {
		return
	}

	if get_message.AccountID != ctx.Ws.User.ID {
		return
	}

	member := database.Member{
		ChannelID: get_message.ChannelID,
		AccountID: ctx.Ws.User.ID,
	}

	ctx.Db.Where(&member).First(&member)
	if member.ID == 0 {
		return
	}

	get_channel := database.Channel{
		ID: get_message.ChannelID,
	}

	ctx.Db.Where(&get_channel).First(&get_channel)

	if get_channel.ID == 0 {
		return
	}

	get_message.Content = message.Content
	get_message.UpdatedAt = time.Now()
	ctx.Db.Save(&get_message)

	author := response.User{
		Uuid:      ctx.Ws.User.Uuid,
		Avatar:    ctx.Ws.User.Avatar,
		Username:  ctx.Ws.User.Username,
		CreatedAt: ctx.Ws.User.CreatedAt.String(),
		UpdatedAt: ctx.Ws.User.UpdatedAt.String(),
	}

	channel_res := response.Channel{
		Uuid:           get_channel.Uuid,
		Name:           get_channel.Name,
		Icon:           get_channel.Icon,
		OwnerID:        get_channel.Owner,
		PrivateChannel: get_channel.PrivateChannel,
		CreatedAt:      get_channel.CreatedAt.String(),
		UpdatedAt:      get_channel.UpdatedAt.String(),
	}

	message_res := response.Message{
		Uuid:      get_message.Uuid,
		Content:   get_message.Content,
		Author:    author,
		Channel:   channel_res,
		CreatedAt: get_message.CreatedAt.String(),
		EditedAt:  get_message.UpdatedAt.String(),
	}

	ws_msg := websocket.WS_Message{
		Event: "MESSAGE_MODIFY",
		Data:  message_res,
	}

	ws_msg_json, err := json.Marshal(ws_msg)
	if err != nil {
		return
	}

	ctx.Send(ws_msg_json)
}

func MessageDelete(ctx *websocket.Context) {
	data := ctx.Data

	var message websocket.MessageDelete
	err := json.Unmarshal(data, &message)
	if err != nil {
		return
	}

	if message.Uuid == "" {
		return
	}

	get_message := database.Message{
		Uuid: message.Uuid,
	}

	ctx.Db.Where(&get_message).First(&get_message)

	if get_message.ID == 0 {
		return
	}

	get_channel := database.Channel{
		ID: get_message.ChannelID,
	}

	ctx.Db.Where(&get_channel).First(&get_channel)

	if get_channel.ID == 0 {
		return
	}

	member := database.Member{
		ChannelID: get_channel.ID,
		AccountID: ctx.Ws.User.ID,
	}

	ctx.Db.Where(&member).First(&member)

	if member.ID == 0 {
		return
	}

	if get_message.AccountID != ctx.Ws.User.ID || get_channel.Owner != ctx.Ws.User.Uuid {
		return
	}

	ctx.Db.Delete(get_message)

	response := websocket.MessageDelete{
		Uuid: get_message.Uuid,
	}

	ws_msg := websocket.WS_Message{
		Event: "MESSAGE_DELETE",
		Data:  response,
	}

	ws_msg_json, _ := json.Marshal(ws_msg)
	ctx.Send(ws_msg_json)
}
