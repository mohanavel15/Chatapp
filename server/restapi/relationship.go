package restapi

import (
	"Chatapp/server/database"
	"Chatapp/server/response"
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	RTDefault = iota
	RTFriend
	RTBlock
	RTInComing
	RTOutGoing
)

func GetRelationships(ctx *Context) {
	relationships := ctx.Db.GetRelationships(ctx.User.ID)

	var res_relationships []response.Relationship

	for _, relationship := range relationships {
		user, statusCode := ctx.Db.GetUser(relationship.ToUserID.Hex())
		if statusCode != http.StatusOK {
			continue
		}

		status := 0
		if relationship.Type == RTFriend {
			status = ctx.Conn.GetUserStatus(user.ID.Hex())
		}

		res_user := response.NewUser(user, status)
		res_relationships = append(res_relationships, response.NewRelationship(res_user, relationship.Type))
	}

	ctx.WriteJSON(res_relationships)
}

func GetRelationship(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	rid := url_vars["rid"]

	relationship_id, err := primitive.ObjectIDFromHex(rid)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	relationshipsCollection := ctx.Db.Mongo.Collection("relationships")

	var relationship database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": ctx.User.ID, "to_user_id": relationship_id}).Decode(&relationship)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	user, statusCode := ctx.Db.GetUser(relationship.ToUserID.Hex())
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	status := 0
	if relationship.Type == 1 {
		status = ctx.Conn.GetUserStatus(user.ID.Hex())
	}

	res_user := response.NewUser(user, status)
	res_relationship := response.NewRelationship(res_user, relationship.Type)

	ctx.WriteJSON(res_relationship)
}

func ChangeRelationshipToDefault(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]
	relationshipsCollection := ctx.Db.Mongo.Collection("relationships")

	relationship_user, statusCode := ctx.Db.GetUser(relationship_id)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	var relationship1 database.Relationship
	err := relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": ctx.User.ID, "to_user_id": relationship_user.ID}).Decode(&relationship1)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: ctx.User.ID,
			ToUserID:   relationship_user.ID,
			Type:       RTDefault,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		_, err = relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": 0}})
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	relationship_user_type := RTBlock

	var relationship2 database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": relationship_user.ID, "to_user_id": ctx.User.ID}).Decode(&relationship2)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: relationship_user.ID,
			ToUserID:   ctx.User.ID,
			Type:       RTDefault,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}

		relationship_user_type = RTDefault
	} else {
		if relationship2.Type != 2 {
			_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship2.ID, bson.M{"$set": bson.M{"type": RTDefault}})
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}

			relationship_user_type = RTDefault
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, ctx.Conn.GetUserStatus(relationship_user.ID.Hex())), 0)
	ctx.WriteJSON(res)
	status := 0
	if relationship_user_type == 1 {
		status = ctx.Conn.GetUserStatus(ctx.User.ID.Hex())
	}
	ctx.Conn.SendToUser(relationship_user.ID.Hex(), "RELATIONSHIP_MODIFY", response.NewRelationship(response.NewUser(&ctx.User, status), relationship_user_type))
}

func ChangeRelationshipToFriend(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]

	relationship_user, statusCode := ctx.Db.GetUser(relationship_id)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	relationship_user_type := RTInComing
	relationshipsCollection := ctx.Db.Mongo.Collection("relationships")

	var relationship1 database.Relationship
	err := relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": relationship_user.ID, "to_user_id": ctx.User.ID}).Decode(&relationship1)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: relationship_user.ID,
			ToUserID:   ctx.User.ID,
			Type:       relationship_user_type,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		if relationship1.Type == 2 {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		if relationship1.Type == RTFriend || relationship1.Type == RTOutGoing {
			relationship_user_type = 1
		}

		_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": relationship_user_type}})
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	relationship_type := RTOutGoing
	if relationship_user_type == RTFriend {
		relationship_type = RTFriend
	}

	var relationship2 database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": ctx.User.ID, "to_user_id": relationship_user.ID}).Decode(&relationship2)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: ctx.User.ID,
			ToUserID:   relationship_user.ID,
			Type:       relationship_type,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		_, err = relationshipsCollection.UpdateByID(context.TODO(), relationship2.ID, bson.M{"$set": bson.M{"type": relationship_type}})
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, ctx.Conn.GetUserStatus(relationship_user.ID.Hex())), relationship_type)
	ctx.WriteJSON(res)
	status := 0
	if relationship_user_type == 1 {
		status = ctx.Conn.GetUserStatus(ctx.User.ID.Hex())
	}
	ctx.Conn.SendToUser(relationship_user.ID.Hex(), "RELATIONSHIP_MODIFY", response.NewRelationship(response.NewUser(&ctx.User, status), relationship_user_type))
}

func ChangeRelationshipToBlock(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]
	relationshipsCollection := ctx.Db.Mongo.Collection("relationships")

	relationship_user, statusCode := ctx.Db.GetUser(relationship_id)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	var relationship1 database.Relationship
	err := relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": ctx.User.ID, "to_user_id": relationship_user.ID}).Decode(&relationship1)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: ctx.User.ID,
			ToUserID:   relationship_user.ID,
			Type:       RTBlock,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		_, err = relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": RTBlock}})
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	var relationship2 database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": relationship_user.ID, "to_user_id": ctx.User.ID}).Decode(&relationship2)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: relationship_user.ID,
			ToUserID:   ctx.User.ID,
			Type:       RTDefault,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}

		relationship2.Type = RTDefault
	} else {
		if relationship2.Type != 2 {
			_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship2.ID, bson.M{"$set": bson.M{"type": 0}})
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}

			relationship2.Type = 0
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, 0), RTBlock)
	ctx.WriteJSON(res)
	ctx.Conn.SendToUser(relationship_user.ID.Hex(), "RELATIONSHIP_MODIFY", response.NewRelationship(response.NewUser(&ctx.User, 0), relationship2.Type))
}
