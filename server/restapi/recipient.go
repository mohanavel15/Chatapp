package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
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

func AddRecipient(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	user_id := url_vars["uid"]

	channelCollection := ctx.Db.Collection("channels")

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type == 1 || channel.OwnerID.Hex() != ctx.User.ID.Hex() {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	user, statusCode := database.GetUser(user_id, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
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
		recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)
	ctx.Conn.AddUserToChannel(user_id, channel_id)
	ctx.Conn.BroadcastToChannel(res_channel.ID, "CHANNEL_MODIFY", res_channel)
}

func RemoveRecipient(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	user_id := url_vars["uid"]

	var request_ request.RemoveRecipient
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request_)

	fmt.Println(request_)

	isBan := request_.IsBan
	reason := strings.TrimSpace(request_.Reason)

	channelCollection := ctx.Db.Collection("channels")
	bansCollection := ctx.Db.Collection("bans")

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type == 1 || channel.OwnerID.Hex() != ctx.User.ID.Hex() {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	user, statusCode := database.GetUser(user_id, ctx.Db)
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
		recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, ctx.Conn.GetUserStatus(recipient.ID.Hex())))
	}

	res_channel := response.NewChannel(channel, recipients)
	ctx.WriteJSON(res_channel)

	ctx.Conn.RemoveUserFromChannel(user.ID.Hex(), channel.ID.Hex())
	ctx.Conn.BroadcastToChannel(channel.ID.Hex(), "CHANNEL_MODIFY", res_channel)
	ctx.Conn.SendToUser(user.ID.Hex(), "CHANNEL_DELETE", res_channel)
}
