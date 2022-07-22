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

func GetPins(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	pins := ctx.Db.Collection("pins")

	object_id, err := primitive.ObjectIDFromHex(channel_id)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	var pinned_messages []database.Pins
	cur, err := pins.Find(context.TODO(), bson.M{"channel_id": object_id})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}
	defer cur.Close(context.TODO())

	err = cur.All(context.TODO(), &pinned_messages)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	messages_res := []response.Message{}
	for _, message := range pinned_messages {
		message, _, statusCode := database.GetMessage(message.MessageID.Hex(), message.ChannelID.Hex(), &ctx.User, ctx.Db)
		if statusCode != http.StatusOK {
			continue
		}

		author, statstatusCode := database.GetUser(message.AccountID.Hex(), ctx.Db)
		if statstatusCode != http.StatusOK {
			continue
		}

		res_author := response.NewUser(author, 0)
		messages_res = append(messages_res, response.NewMessage(message, res_author))
	}

	ctx.WriteJSON(messages_res)
}

func PinMsg(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	pins := ctx.Db.Collection("pins")

	message, _, statusCode := database.GetMessage(message_id, channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	err := pins.FindOne(context.TODO(), bson.M{"channel_id": message.ChannelID, "message_id": message.ID}).Err()
	if err == nil {
		ctx.Res.WriteHeader(http.StatusNotModified)
		return
	}

	pin := database.Pins{
		ID:        primitive.NewObjectID(),
		ChannelID: message.ChannelID,
		MessageID: message.ID,
		CreatedAt: time.Now().Unix(),
	}

	_, err = pins.InsertOne(context.TODO(), pin)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	author, statusCode := database.GetUser(message.AccountID.Hex(), ctx.Db)
	if statusCode != http.StatusOK {
		return
	}

	author_res := response.NewUser(author, 0)
	res := response.NewMessage(message, author_res)

	ctx.WriteJSON(res)
	ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_PINNED", res)
}

func UnpinMsg(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	pins := ctx.Db.Collection("pins")

	message, _, statusCode := database.GetMessage(message_id, channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	err := pins.FindOne(context.TODO(), bson.M{"channel_id": message.ChannelID, "message_id": message.ID}).Err()
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotModified)
		return
	}

	_, err = pins.DeleteOne(context.TODO(), bson.M{"channel_id": message.ChannelID, "message_id": message.ID})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	author, statusCode := database.GetUser(message.AccountID.Hex(), ctx.Db)
	if statusCode != http.StatusOK {
		return
	}

	author_res := response.NewUser(author, 0)
	res := response.NewMessage(message, author_res)

	ctx.WriteJSON(res)
	ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_UNPINNED", res)
}
