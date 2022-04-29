package gateway

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"
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

	new_message, statusCode := database.CreateMessage(message.Content, message.Channel, ctx.Ws.User, ctx.Ws.Db)
	if statusCode != http.StatusOK {
		ws_error_msg := websocket.WS_Message{
			Event: "MESSAGE_CREATE",
			Data: response.Message{
				Uuid:      uuid.New().String(),
				Content:   "Couldn't send message. This message will be deleted in 15 seconds.",
				Author:    response.ErrorUser(),
				ChannelID: message.Channel,
				CreatedAt: time.Now().Unix(),
				EditedAt:  time.Now().Unix(),
			},
		}

		res, _ := json.Marshal(ws_error_msg)
		err := ctx.Ws.Write(res)
		if err != nil {
			return
		}
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
