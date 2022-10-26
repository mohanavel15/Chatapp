package restapi

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/request"
	"Chatapp/pkg/response"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	INVITE_JOIN      = "%s has joined using the invite."
	ADD_RECIPIENT    = "%s added %s to the channel."
	REMOVE_RECIPIENT = "%s %s %s from the channel."
	REASON           = "Reason: %s."
	RECIPIENT_LEAVE  = "%s has left the channel."
)

func AddRecipient(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	user_id := url_vars["uid"]

	channelCollection := ctx.Db.Mongo.Collection("channels")

	channel, statusCode := ctx.Db.GetChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type == 1 || channel.OwnerID.Hex() != ctx.User.ID.Hex() {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	user, statusCode := ctx.Db.GetUser(user_id)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	relationship, statusCode := ctx.Db.GetRelationship(ctx.User.ID, user.ID)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if relationship.Type != 1 {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	rd := options.After
	result := channelCollection.FindOneAndUpdate(context.TODO(), bson.M{"_id": channel.ID}, bson.M{"$push": bson.M{"recipients": user.ID}}, &options.FindOneAndUpdateOptions{ReturnDocument: &rd})
	if result.Err() != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	result.Decode(&channel)

	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		recipient, _ := ctx.Db.GetUser(recipient.Hex())
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)
	ctx.Conn.AddUserToChannel(user_id, channel_id)
	ctx.Conn.BroadcastToChannel(res_channel.ID, "CHANNEL_MODIFY", res_channel)

	add := fmt.Sprintf(ADD_RECIPIENT, ctx.User.Username, user.Username)
	message, statusCode := ctx.Db.CreateMessage(add, channel_id, true, nil)

	if statusCode != http.StatusOK {
		return
	}

	res_message := response.NewMessage(message, response.User{})
	ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_CREATE", res_message)
}

func RemoveRecipient(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	user_id := url_vars["uid"]

	var request_ request.RemoveRecipient
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request_)

	isBan := request_.IsBan
	reason := strings.TrimSpace(request_.Reason)

	channelCollection := ctx.Db.Mongo.Collection("channels")
	bansCollection := ctx.Db.Mongo.Collection("bans")

	channel, statusCode := ctx.Db.GetChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type == 1 || channel.OwnerID.Hex() != ctx.User.ID.Hex() {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	user, statusCode := ctx.Db.GetUser(user_id)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if isBan {
		ban := database.Ban{
			ID:         primitive.NewObjectID(),
			BannedUser: user.ID,
			ChannelID:  channel.ID,
			BannedBy:   ctx.User.ID,
			Reason:     reason,
			CreatedAt:  time.Now().Unix(),
		}

		_, err := bansCollection.InsertOne(context.TODO(), ban)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	rd := options.After
	result := channelCollection.FindOneAndUpdate(context.TODO(), bson.M{"_id": channel.ID}, bson.M{"$pull": bson.M{"recipients": user.ID}}, &options.FindOneAndUpdateOptions{ReturnDocument: &rd})
	if result.Err() != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	result.Decode(&channel)
	recipients := []response.User{}
	for _, recipient := range channel.Recipients {
		recipient, _ := ctx.Db.GetUser(recipient.Hex())
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)

	ctx.Conn.RemoveUserFromChannel(user.ID.Hex(), channel.ID.Hex())
	ctx.Conn.BroadcastToChannel(channel.ID.Hex(), "CHANNEL_MODIFY", res_channel)
	ctx.Conn.SendToUser(user.ID.Hex(), "CHANNEL_DELETE", res_channel)

	kickorban := "kicked"
	if isBan {
		kickorban = "banned"
	}

	remove := fmt.Sprintf(REMOVE_RECIPIENT, ctx.User.Username, kickorban, user.Username)

	if reason != "" {
		remove = fmt.Sprint(remove, " ", fmt.Sprintf(REASON, reason))
	}

	message, statusCode := ctx.Db.CreateMessage(remove, channel_id, true, nil)

	if statusCode != http.StatusOK {
		return
	}

	res_message := response.NewMessage(message, response.User{})
	ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_CREATE", res_message)
}
