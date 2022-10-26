package restapi

import (
	"Chatapp/pkg/request"
	"Chatapp/pkg/response"
	"encoding/json"
	"fmt"
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

	channel, statusCode := ctx.Db.CreateChannel(name, icon, recipientID, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	if channel.Type == 1 {
		recipient, _ := ctx.Db.GetUser(recipientID)
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	} else {
		recipients = append(recipients, response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)
	ctx.Conn.AddUserToChannel(ctx.User.ID.Hex(), channel.ID.Hex())
	if channel.Type == 1 {
		recipient := res_channel.Recipients[0]
		ctx.Conn.AddUserToChannel(recipient.ID, res_channel.ID)
		res_user := response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex()))
		ctx.Conn.SendToUser(recipient.ID, "CHANNEL_CREATE", response.NewChannel(channel, []response.User{res_user}))
	}
}

func GetChannels(ctx *Context) {
	res_channels := response.Channels{}
	channels := ctx.Db.GetChannels(&ctx.User)
	for _, channel := range channels {
		recipients := []response.User{}
		for _, recipient := range channel.Recipients {
			if channel.Type == 1 && recipient.Hex() == ctx.User.ID.Hex() {
				continue
			}
			recipient, _ := ctx.Db.GetUser(recipient.Hex())
			recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
		}

		res_channels = append(res_channels, response.NewChannel(&channel, recipients))
	}

	ctx.WriteJSON(res_channels)
}

func GetChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel, statusCode := ctx.Db.GetChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		if channel.Type == 1 && recipient.Hex() == ctx.User.ID.Hex() {
			continue
		}
		recipient, _ := ctx.Db.GetUser(recipient.Hex())
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
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

	channel, statusCode := ctx.Db.ModifyChannel(channel_id, name, icon, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		recipient, _ := ctx.Db.GetUser(recipient.Hex())
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)

	ctx.WriteJSON(res_channel)
	ctx.Conn.BroadcastToChannel(res_channel.ID, "CHANNEL_MODIFY", res_channel)
}

func DeleteChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel, statusCode := ctx.Db.DeleteChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		recipient, _ := ctx.Db.GetUser(recipient.Hex())
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)

	ctx.WriteJSON(res_channel)
	ctx.Conn.RemoveUserFromChannel(ctx.User.ID.Hex(), channel_id)
	ctx.Conn.BroadcastToChannel(channel.ID.Hex(), "CHANNEL_MODIFY", res_channel)

	recipient_leave := fmt.Sprintf(RECIPIENT_LEAVE, ctx.User.Username)
	message, statusCode := ctx.Db.CreateMessage(recipient_leave, res_channel.ID, true, nil)

	if statusCode != http.StatusOK {
		return
	}

	res_message := response.NewMessage(message, response.User{})
	ctx.Conn.BroadcastToChannel(res_channel.ID, "MESSAGE_CREATE", res_message)
}
