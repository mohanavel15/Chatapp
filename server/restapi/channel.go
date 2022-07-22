package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func CreateChannel(ctx *Context) {
	var request request.Channel
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)

	name := strings.TrimSpace(request.Name)
	icon := strings.TrimSpace(request.Icon)
	recipientID := strings.TrimSpace(request.RecipientID)

	if name == "" && recipientID == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	channel, statusCode := database.CreateChannel(name, icon, recipientID, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	if channel.Type == 1 {
		recipient, _ := database.GetUser(recipientID, ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, 0))
	} else {
		recipients = append(recipients, response.NewUser(&ctx.User, 0))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)
	ctx.Conn.AddUserToChannel(ctx.User.ID.Hex(), channel.ID.Hex())
}

func GetChannels(ctx *Context) {
	res_channels := response.Channels{}
	channels := database.GetChannels(&ctx.User, ctx.Db)
	for _, channel := range channels {
		recipients := []response.User{}
		for _, recipient := range channel.Recipients {
			if channel.Type == 1 && recipient.Hex() == ctx.User.ID.Hex() {
				continue
			}
			recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
			recipients = append(recipients, response.NewUser(recipient, 0))
		}

		res_channels = append(res_channels, response.NewChannel(&channel, recipients))
	}

	ctx.WriteJSON(res_channels)
}

func GetChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		if channel.Type == 1 && recipient.Hex() == ctx.User.ID.Hex() {
			continue
		}
		recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, 0))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)
}

func EditChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	var request request.EditChannel
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)

	name := strings.TrimSpace(request.Name)
	icon := strings.TrimSpace(request.Icon)

	if name == "" && icon == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	channel, statusCode := database.ModifyChannel(channel_id, name, icon, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, 0))
	}

	res_channel := response.NewChannel(channel, recipients)

	ctx.WriteJSON(res_channel)
	ctx.Conn.BroadcastToChannel(res_channel.ID, "CHANNEL_MODIFY", res_channel)
}

func DeleteChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel, statusCode := database.DeleteChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, 0))
	}

	res_channel := response.NewChannel(channel, recipients)

	ctx.WriteJSON(res_channel)
	ctx.Conn.RemoveUserFromChannel(ctx.User.ID.Hex(), channel_id)
	ctx.Conn.BroadcastToChannel(channel.ID.Hex(), "CHANNEL_MODIFY", res_channel)
}
