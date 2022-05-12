package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func GetPins(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	var pinned_messages []database.Pins
	ctx.Db.Where("channel_id = ?", channel_id).Find(&pinned_messages)

	messages_res := []response.Message{}
	for _, message := range pinned_messages {
		message, statusCode := database.GetMessage(message.MessageID, &ctx.User, ctx.Db)
		if statusCode != http.StatusOK {
			continue
		}

		var author *database.Account
		ctx.Db.Where("id = ?", message.AccountID).First(&author)

		res_author := response.NewUser(author, 0)
		messages_res = append(messages_res, response.NewMessage(message, res_author))
	}

	res, _ := json.Marshal(messages_res)

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func PinMsg(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	message, statusCode := database.GetMessage(message_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if message.ChannelID != channel_id {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	pin := database.Pins{
		ChannelID: channel_id,
		MessageID: message_id,
	}
	ctx.Db.Where(pin).First(&pin)
	if pin.ID == 0 {
		ctx.Db.Create(&pin)
	}

	ctx.Res.WriteHeader(http.StatusOK)
}

func UnpinMsg(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	message, statusCode := database.GetMessage(message_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if message.ChannelID != channel_id {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	pin := database.Pins{
		ChannelID: channel_id,
		MessageID: message_id,
	}
	ctx.Db.Where(pin).First(&pin)
	if pin.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}
	ctx.Db.Delete(&pin)
	ctx.Res.WriteHeader(http.StatusOK)
}
