package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"context"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func JoinInvite(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	invite_code := vars["id"]

	inviteCollection := ctx.Db.Collection("invites")
	channelCollection := ctx.Db.Collection("channels")
	banCollection := ctx.Db.Collection("bans")

	var invite database.Invites
	err := inviteCollection.FindOne(context.TODO(), bson.M{"invite_code": invite_code}).Decode(&invite)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	var channel database.Channel
	err = channelCollection.FindOne(context.TODO(), bson.M{"_id": invite.ChannelID}).Decode(&channel)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	err = banCollection.FindOne(context.TODO(), bson.M{"banned_user": ctx.User.ID, "channel_id": channel.ID}).Err()
	if err == nil {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	_, err = channelCollection.UpdateOne(context.TODO(), bson.M{"_id": channel.ID}, bson.M{"$push": bson.M{"recipients": ctx.User.ID}})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	channel_, statusCode := database.GetChannel(invite.ChannelID.Hex(), &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	recipients := []response.User{}
	for _, recipient := range channel_.Recipients {
		if channel_.Type == 1 && recipient.Hex() == ctx.User.ID.Hex() {
			continue
		}
		recipient, _ := database.GetUser(recipient.Hex(), ctx.Db)
		recipients = append(recipients, response.NewUser(recipient, 0))
	}

	res_channel := response.NewChannel(channel_, recipients)
	ctx.WriteJSON(res_channel)
}

func GetInvites(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	inviteCollection := ctx.Db.Collection("invites")

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.OwnerID != ctx.User.ID {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	cur, err := inviteCollection.Find(context.TODO(), bson.M{"channel_id": channel.ID})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	invites := []response.Invite{}
	for cur.Next(context.TODO()) {
		var invite database.Invites
		err := cur.Decode(&invite)
		if err != nil {
			continue
		}
		invite_obj := response.Invite{
			InviteCode: invite.InviteCode,
			CreatedAt:  invite.CreatedAt.String(),
		}
		invites = append(invites, invite_obj)
	}

	ctx.WriteJSON(invites)
}

func CreateInvite(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	inviteCollection := ctx.Db.Collection("invites")

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.OwnerID != ctx.User.ID {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	invite := database.Invites{
		ID:         primitive.NewObjectID(),
		InviteCode: primitive.NewObjectID().Hex(),
		ChannelID:  channel.ID,
		AccountID:  ctx.User.ID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err := inviteCollection.InsertOne(context.TODO(), &invite)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.WriteJSON(response.Invite{
		InviteCode: invite.InviteCode,
		CreatedAt:  invite.CreatedAt.String(),
	})
}

func DeleteInvite(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	invite_code := vars["iid"]

	inviteCollection := ctx.Db.Collection("invites")

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.OwnerID != ctx.User.ID {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	_, err := inviteCollection.DeleteOne(context.TODO(), bson.M{"channel_id": channel.ID, "invite_code": invite_code})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.WriteHeader(http.StatusOK)
}
