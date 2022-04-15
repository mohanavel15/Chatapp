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

	get_dm_channel := database.DMChannel{
		Uuid: message.Channel,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != ctx.Ws.User.ID && get_dm_channel.ToUser != ctx.Ws.User.ID {
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != ctx.Ws.User.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			return
		}

		new_message := database.Message{
			Uuid:      uuid.New().String(),
			Content:   message.Content,
			ChannelID: get_dm_channel.Uuid,
			AccountID: ctx.Ws.User.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		ctx.Db.Create(&new_message)

		var status int
		isConnected := ctx.Ws.Conns.Users[ctx.Ws.User.Uuid]
		if isConnected == nil {
			status = 0
		} else {
			status = 1
		}

		author := response.NewUser(ctx.Ws.User, status)

		message_res := response.Message{
			Uuid:      new_message.Uuid,
			Content:   new_message.Content,
			Author:    author,
			ChannelID: get_dm_channel.Uuid,
			CreatedAt: new_message.CreatedAt.Unix(),
			EditedAt:  new_message.UpdatedAt.Unix(),
		}

		ws_msg := websocket.WS_Message{
			Event: "MESSAGE_CREATE",
			Data:  message_res,
		}

		res_, err := json.Marshal(ws_msg)
		if err != nil {
			return
		}

		ctx.Send(res_)
		if user, ok := ctx.Ws.Conns.Users[get_user2.Uuid]; ok {
			user.Write(res_)
		}
	} else {
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
			ChannelID: get_channel.Uuid,
			AccountID: ctx.Ws.User.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		ctx.Db.Create(&new_message)

		author := response.User{
			Uuid:      ctx.Ws.User.Uuid,
			Avatar:    ctx.Ws.User.Avatar,
			Username:  ctx.Ws.User.Username,
			CreatedAt: ctx.Ws.User.CreatedAt.Unix(),
		}

		message_res := response.Message{
			Uuid:      new_message.Uuid,
			Content:   new_message.Content,
			Author:    author,
			ChannelID: get_channel.Uuid,
			CreatedAt: new_message.CreatedAt.Unix(),
			EditedAt:  new_message.UpdatedAt.Unix(),
		}

		ws_msg := websocket.WS_Message{
			Event: "MESSAGE_CREATE",
			Data:  message_res,
		}

		ctx.Broadcast(ws_msg)
	}
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
	ctx.Db.Where(&get_message).First(&get_message)

	if get_message.ID == 0 {
		return
	}

	if get_message.AccountID != ctx.Ws.User.ID {
		return
	}

	get_dm_channel := database.DMChannel{
		Uuid: get_message.ChannelID,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != ctx.Ws.User.ID && get_dm_channel.ToUser != ctx.Ws.User.ID {
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != ctx.Ws.User.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			return
		}

		get_message.Content = message.Content
		get_message.UpdatedAt = time.Now()
		ctx.Db.Save(&get_message)

		author := response.User{
			Uuid:      ctx.Ws.User.Uuid,
			Avatar:    ctx.Ws.User.Avatar,
			Username:  ctx.Ws.User.Username,
			CreatedAt: ctx.Ws.User.CreatedAt.Unix(),
		}

		message_res := response.Message{
			Uuid:      get_message.Uuid,
			Content:   get_message.Content,
			Author:    author,
			ChannelID: get_dm_channel.Uuid,
			CreatedAt: get_message.CreatedAt.Unix(),
			EditedAt:  get_message.UpdatedAt.Unix(),
		}

		ws_msg := websocket.WS_Message{
			Event: "MESSAGE_MODIFY",
			Data:  message_res,
		}

		res_, err := json.Marshal(ws_msg)
		if err != nil {
			return
		}

		ctx.Send(res_)
		if user, ok := ctx.Ws.Conns.Users[get_user2.Uuid]; ok {
			user.Write(res_)
		}

	} else {
		get_channel := database.Channel{
			Uuid: get_message.ChannelID,
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

		get_message.Content = message.Content
		get_message.UpdatedAt = time.Now()
		ctx.Db.Save(&get_message)

		author := response.User{
			Uuid:      ctx.Ws.User.Uuid,
			Avatar:    ctx.Ws.User.Avatar,
			Username:  ctx.Ws.User.Username,
			CreatedAt: ctx.Ws.User.CreatedAt.Unix(),
		}

		message_res := response.Message{
			Uuid:      get_message.Uuid,
			Content:   get_message.Content,
			Author:    author,
			ChannelID: get_channel.Uuid,
			CreatedAt: get_message.CreatedAt.Unix(),
			EditedAt:  get_message.UpdatedAt.Unix(),
		}

		ws_msg := websocket.WS_Message{
			Event: "MESSAGE_MODIFY",
			Data:  message_res,
		}

		ctx.Broadcast(ws_msg)
	}
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

	get_dm_channel := database.DMChannel{
		Uuid: get_message.ChannelID,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != ctx.Ws.User.ID && get_dm_channel.ToUser != ctx.Ws.User.ID {
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != ctx.Ws.User.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			return
		}

		ctx.Db.Delete(&get_message)

		response := response.Message{
			Uuid:      get_message.Uuid,
			Content:   get_message.Content,
			ChannelID: get_dm_channel.Uuid,
			CreatedAt: get_message.CreatedAt.Unix(),
			EditedAt:  get_message.UpdatedAt.Unix(),
		}

		ws_msg := websocket.WS_Message{
			Event: "MESSAGE_DELETE",
			Data:  response,
		}

		res_, err := json.Marshal(ws_msg)
		if err != nil {
			return
		}

		ctx.Send(res_)
		if user, ok := ctx.Ws.Conns.Users[get_user2.Uuid]; ok {
			user.Write(res_)
		}

	} else {
		get_channel := database.Channel{
			Uuid: get_message.ChannelID,
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

		if get_message.AccountID != ctx.Ws.User.ID && get_channel.Owner != ctx.Ws.User.Uuid {
			return
		}

		ctx.Db.Delete(get_message)

		response := response.Message{
			Uuid:      get_message.Uuid,
			Content:   get_message.Content,
			ChannelID: get_channel.Uuid,
			CreatedAt: get_message.CreatedAt.Unix(),
			EditedAt:  get_message.UpdatedAt.Unix(),
		}

		ws_msg := websocket.WS_Message{
			Event: "MESSAGE_DELETE",
			Data:  response,
		}

		ctx.Broadcast(ws_msg)
	}
}
