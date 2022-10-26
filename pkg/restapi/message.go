package restapi

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/request"
	"Chatapp/pkg/response"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetMessages(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	querys := ctx.Req.URL.Query()

	limit, _ := strconv.ParseInt(querys.Get("limit"), 10, 64)
	offset, _ := strconv.ParseInt(querys.Get("offset"), 10, 64)
	if limit == 0 {
		limit = 25
	} else if limit > 100 {
		limit = 100
	}

	messages, statusCode := ctx.Db.GetMessages(channel_id, limit, offset, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	messages_res := []response.Message{}
	for _, message := range messages {
		if message.SystemMessage {
			messages_res = append(messages_res, response.NewMessage(&message, response.User{}))
			continue
		}

		user, statusCode := ctx.Db.GetUser(message.AccountID.Hex())
		if statusCode != http.StatusOK {
			continue
		}
		messages_res = append(messages_res, response.NewMessage(&message, response.NewUser(user, 0)))
	}

	ctx.WriteJSON(messages_res)
}

func GetMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	message, _, statusCode := ctx.Db.GetMessage(message_id, channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	var message_res response.Message

	if message.SystemMessage {
		var user response.User
		message_res = response.NewMessage(message, user)
	} else {
		user, statusCode := ctx.Db.GetUser(message.AccountID.Hex())
		if statusCode != http.StatusOK {
			ctx.Res.WriteHeader(statusCode)
			return
		}

		message_res = response.NewMessage(message, response.NewUser(user, 0))
	}

	ctx.WriteJSON(message_res)
}

func CreateMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	content_type := ctx.Req.Header.Get("Content-Type")
	if content_type == "application/json" {
		var message_req request.Message
		err := json.NewDecoder(ctx.Req.Body).Decode(&message_req)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		content := strings.TrimSpace(message_req.Content)

		if content == "" {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		message, statusCode := ctx.Db.CreateMessage(content, channel_id, false, &ctx.User)
		if statusCode != http.StatusOK {
			ctx.Res.WriteHeader(statusCode)
			return
		}

		message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))

		ctx.WriteJSON(message_res)
		ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_CREATE", message_res)
	} else {
		content := ctx.Req.FormValue("content")
		file, handler, err := ctx.Req.FormFile("file")
		if err != nil {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}
		defer file.Close()

		if handler.Size > 8388608 {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		file_data, err := io.ReadAll(file)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		filename := strings.ReplaceAll(handler.Filename, " ", "_")

		db_attachment := database.Attachment{
			ID:          primitive.NewObjectID(),
			Filename:    filename,
			Size:        handler.Size,
			ContentType: handler.Header["Content-Type"][0],
			Data:        file_data,
		}

		content = strings.TrimSpace(content)
		message, statusCode := ctx.Db.CreateMessage(content, channel_id, false, &ctx.User)
		if statusCode != http.StatusOK {
			ctx.Res.WriteHeader(statusCode)
			return
		}
		message.Attachments = []database.Attachment{db_attachment}

		messageCollection := ctx.Db.Mongo.Collection("messages")
		messageCollection.UpdateOne(context.TODO(), bson.M{"_id": message.ID}, bson.M{"$set": bson.M{"attachments": message.Attachments}})

		message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))

		ctx.WriteJSON(message_res)
		ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_CREATE", message_res)
	}
}

func EditMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	var message_req request.Message
	err := json.NewDecoder(ctx.Req.Body).Decode(&message_req)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	content := strings.TrimSpace(message_req.Content)

	if content == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	message, statusCode := ctx.Db.EditMessage(message_id, channel_id, content, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))

	ctx.WriteJSON(message_res)
	ctx.Conn.BroadcastToChannel(message_res.ChannelID, "MESSAGE_MODIFY", message_res)
}

func DeleteMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	message, statusCode := ctx.Db.DeleteMessage(message_id, channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	user, statusCode := ctx.Db.GetUser(message.AccountID.Hex())
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(user, 0))

	ctx.WriteJSON(message_res)
	ctx.Conn.BroadcastToChannel(message_res.ChannelID, "MESSAGE_DELETE", message_res)
}
