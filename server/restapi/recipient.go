package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
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
	}

	user, statusCode := database.GetUser(user_id, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
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
}

func RemoveRecipient(ctx *Context) {
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
}
