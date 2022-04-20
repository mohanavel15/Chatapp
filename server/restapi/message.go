package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func GetMessages(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	messages, statusCode := database.GetMessages(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	messages_res := []response.Message{}
	for _, message := range messages {
		var author database.Account
		ctx.Db.Where("id = ?", message.AccountID).First(&author)
		messages_res = append(messages_res, response.NewMessage(&message, response.NewUser(&author, 0)))
	}

	res, err := json.Marshal(messages_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func GetMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	message_id := vars["mid"]

	message, statusCode := database.GetMessage(message_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))

	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func CreateMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	var message_req request.Message
	err := json.NewDecoder(ctx.Req.Body).Decode(&message_req)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	if message_req.Content == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	message, statusCode := database.CreateMessage(message_req.Content, channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))
	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)

	websocket.BroadcastToChannel(ctx.Conn, channel_id, "MESSAGE_CREATE", message_res)
}

func EditMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	message_id := vars["mid"]

	var message_req request.Message
	err := json.NewDecoder(ctx.Req.Body).Decode(&message_req)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	if message_req.Content == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	message, statusCode := database.EditMessage(message_id, message_req.Content, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}
	message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))
	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
	websocket.BroadcastToChannel(ctx.Conn, message_res.ChannelID, "MESSAGE_MODIFY", message_res)
}

func DeleteMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	message_id := vars["mid"]

	message, statusCode := database.DeleteMessage(message_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}
	message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))
	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
	websocket.BroadcastToChannel(ctx.Conn, message_res.ChannelID, "MESSAGE_DELETE", message_res)
}
