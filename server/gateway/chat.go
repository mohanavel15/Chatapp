package gateway

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"
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

	new_message, statusCode := database.CreateMessage(message.Content, message.Channel, ctx.Ws.User, ctx.Ws.Db)
	if statusCode != http.StatusOK {
		return
	}

	author := response.NewUser(ctx.Ws.User, 0)
	message_res := response.NewMessage(new_message, author)

	websocket.BroadcastToChannel(ctx.Ws.Conns, message.Channel, "MESSAGE_CREATE", message_res)
}

func MessageModify(ctx *websocket.Context) {
	data := ctx.Data

	var message_req websocket.MessageEdit
	err := json.Unmarshal(data, &message_req)
	if err != nil {
		return
	}

	if message_req.Uuid == "" || message_req.Content == "" {
		return
	}

	message, statusCode := database.EditMessage(message_req.Uuid, message_req.Content, ctx.Ws.User, ctx.Db)
	if statusCode != http.StatusOK {
		return
	}
	author := response.NewUser(ctx.Ws.User, 0)
	message_res := response.NewMessage(message, author)
	websocket.BroadcastToChannel(ctx.Ws.Conns, message_res.ChannelID, "MESSAGE_MODIFY", message_res)
}

func MessageDelete(ctx *websocket.Context) {
	data := ctx.Data

	var message_req websocket.MessageDelete
	err := json.Unmarshal(data, &message_req)
	if err != nil {
		return
	}

	if message_req.Uuid == "" {
		return
	}

	message, statusCode := database.DeleteMessage(message_req.Uuid, ctx.Ws.User, ctx.Db)
	if statusCode != http.StatusOK {
		return
	}

	message_res := response.NewMessage(message, response.NewUser(ctx.Ws.User, 0))
	websocket.BroadcastToChannel(ctx.Ws.Conns, message_res.ChannelID, "MESSAGE_DELETE", message_res)
}
