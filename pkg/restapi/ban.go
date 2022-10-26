package restapi

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/response"
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetAllBans(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	banCollection := ctx.Db.Mongo.Collection("bans")

	channel, statusCode := ctx.Db.GetChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type != 2 || ctx.User.ID != channel.OwnerID {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	cur, err := banCollection.Find(context.TODO(), bson.M{"channel_id": channel.ID})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	res_bans := []response.Ban{}

	for cur.Next(context.TODO()) {
		var ban database.Ban
		err := cur.Decode(&ban)
		if err != nil {
			continue
		}

		BannedBy, statusCode := ctx.Db.GetUser(ban.BannedBy.Hex())
		if statusCode != http.StatusOK {
			continue
		}

		BannedUser, statusCode := ctx.Db.GetUser(ban.BannedUser.Hex())
		if statusCode != http.StatusOK {
			continue
		}

		res_bans = append(res_bans, response.NewBan(response.NewUser(BannedBy, 0), response.NewUser(BannedUser, 0), ban.ChannelID.Hex(), &ban))
	}

	ctx.WriteJSON(res_bans)
}

func GetBan(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	ban_id := url_vars["bid"]
	banCollection := ctx.Db.Mongo.Collection("bans")

	ban_object_id, err := primitive.ObjectIDFromHex(ban_id)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	channel, statusCode := ctx.Db.GetChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type != 2 || ctx.User.ID != channel.OwnerID {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	var ban database.Ban
	err = banCollection.FindOne(context.TODO(), bson.M{"channel_id": channel.ID, "_id": ban_object_id}).Decode(&ban)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	BannedBy, statusCode := ctx.Db.GetUser(ban.BannedBy.Hex())
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	BannedUser, statusCode := ctx.Db.GetUser(ban.BannedUser.Hex())
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	res_ban := response.NewBan(response.NewUser(BannedBy, 0), response.NewUser(BannedUser, 0), channel_id, &ban)
	ctx.WriteJSON(res_ban)
}

func DeleteBan(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	ban_id := url_vars["bid"]
	banCollection := ctx.Db.Mongo.Collection("bans")

	ban_object_id, err := primitive.ObjectIDFromHex(ban_id)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	channel, statusCode := ctx.Db.GetChannel(channel_id, &ctx.User)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	if channel.Type != 2 || ctx.User.ID != channel.OwnerID {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	_, err = banCollection.DeleteOne(context.TODO(), bson.M{"channel_id": channel.ID, "_id": ban_object_id})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	ctx.Res.WriteHeader(http.StatusOK)
}
