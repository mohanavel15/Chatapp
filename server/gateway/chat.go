package gateway

import (
	"Chatapp/database"
	"Chatapp/websocket"
	"encoding/json"

	"github.com/google/uuid"
)

func MessageCreate(ctx *websocket.Context) {
	raw_message := ctx.Data

	var message websocket.Message
	err := json.Unmarshal([]byte(raw_message), &message)
	if err != nil {
		return
	}

	if message.Channel.Uuid == "" || message.Content == "" {
		return
	}

	get_user := database.Account{
		Uuid: ctx.Ws.User.Uuid,
	}

	db.Where(&get_user).First(&get_user)

	get_channel := database.Channel{
		Uuid: message.Channel.Uuid,
	}

	db.Where(&get_channel).First(&get_channel)

	//author_is_member := false
	/*for _, member := range get_channel.Members {
		if member.Uuid == get_user.Uuid {
			author_is_member = true
		}
	}

	if !author_is_member {
		return
	}*/

	new_message := database.Message{
		Uuid:    uuid.New().String(),
		Content: message.Content,
	}
	db.Create(&new_message)

	response := websocket.Message{
		Uuid:    new_message.Uuid,
		Content: new_message.Content,
		Author: websocket.User{
			Uuid:     get_user.Uuid,
			Avatar:   get_user.Avatar,
			Username: get_user.Username,
		},
		Channel: websocket.Channel{
			Uuid: get_channel.Uuid,
			Name: get_channel.Name,
		},
	}

	ws_msg := websocket.WS_Message{
		Event: "MESSAGE_CREATE",
		Data:  response,
	}

	ws_msg_json, _ := json.Marshal(ws_msg)

	ctx.Send(ws_msg_json)
}

func MessageModify(ctx *websocket.Context) {
	data := ctx.Data

	var message websocket.Message
	err := json.Unmarshal([]byte(data), &message)
	if err != nil {
		return
	}

	if message.Uuid == "" || message.Content == "" {
		return
	}

	get_message := database.Message{
		Uuid: message.Uuid,
	}

	db.Where(&get_message).First(&get_message)

	if get_message.Uuid == "" {
		return
	}

	get_author := database.Account{
		ID: get_message.AccountID,
	}

	db.Where(&get_author).First(&get_author)

	if get_author.Uuid != ctx.Ws.User.Uuid {
		return
	}

	get_channel := database.Channel{
		Uuid: message.Channel.Uuid,
	}

	db.Where(&get_channel).First(&get_channel)

	/*
		author_is_member := false
		for _, member := range get_channel.Members {
			if member.Uuid == get_author.Uuid {
				author_is_member = true
			}
		}

		if !author_is_member {
			return
		}*/

	db.Model(&get_message).Update("content", message.Content)

	response := websocket.Message{
		Uuid:    message.Uuid,
		Content: message.Content,
		Author: websocket.User{
			Uuid:     get_author.Uuid,
			Avatar:   get_author.Avatar,
			Username: get_author.Username,
		},
		Channel: websocket.Channel{
			Uuid: get_channel.Uuid,
			Name: get_channel.Name,
		},
	}

	ws_msg := websocket.WS_Message{
		Event: "MESSAGE_MODIFY",
		Data:  response,
	}

	ws_msg_json, _ := json.Marshal(ws_msg)

	ctx.Send(ws_msg_json)
}

func MessageDelete(ctx *websocket.Context) {
	data := ctx.Data

	var message websocket.Message
	err := json.Unmarshal([]byte(data), &message)
	if err != nil {
		return
	}

	if message.Uuid == "" || message.Content == "" {
		return
	}

	get_message := database.Message{
		Uuid: message.Uuid,
	}

	db.Where(&get_message).First(&get_message)

	if get_message.Uuid == "" {
		return
	}

	get_author := database.Account{
		ID: get_message.AccountID,
	}
	db.Where(&get_author).First(&get_author)

	if get_author.Uuid != ctx.Ws.User.Uuid {
		return
	}

	get_channel := database.Channel{
		Uuid: message.Channel.Uuid,
	}

	db.Where(&get_channel).First(&get_channel)

	/*
		author_is_member := false
		for _, member := range get_channel.Members {
			if member.Uuid == get_author.Uuid {
				author_is_member = true
			}
		}

		if !author_is_member {
			return
		}*/

	db.Model(&get_message).Delete("content", message.Content)

	response := ws.Message{
		Uuid: message.Uuid,
	}

	ws_msg := ws.WS_Message{
		Event: "MESSAGE_DELETE",
		Data:  response,
	}

	ws_msg_json, _ := json.Marshal(ws_msg)

	ctx.Send(ws_msg_json)
}
