package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetRelationships(ctx *Context) {
	relationships := database.GetRelationships(ctx.User.ID, ctx.Db)

	var res_relationships []response.Relationship

	for _, relationship := range relationships {
		user, statusCode := database.GetUser(relationship.ToUserID.Hex(), ctx.Db)
		if statusCode != http.StatusOK {
			continue
		}

		res_user := response.NewUser(user, ctx.Conn.GetUserStatus(user.ID.Hex()))
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

	relationshipsCollection := ctx.Db.Collection("relationships")

	var relationship database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": ctx.User.ID, "to_user_id": relationship_id}).Decode(&relationship)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	user, statusCode := database.GetUser(relationship.ToUserID.Hex(), ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	res_user := response.NewUser(user, ctx.Conn.GetUserStatus(user.ID.Hex()))
	res_relationship := response.NewRelationship(res_user, relationship.Type)

	ctx.WriteJSON(res_relationship)
}

func ChangeRelationshipToDefault(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]
	relationshipsCollection := ctx.Db.Collection("relationships")

	relationship_user, statusCode := database.GetUser(relationship_id, ctx.Db)
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
			Type:       0,
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

	relationship_user_type := 2

	var relationship2 database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": relationship_user.ID, "to_user_id": ctx.User.ID}).Decode(&relationship2)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: relationship_user.ID,
			ToUserID:   ctx.User.ID,
			Type:       0,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}

		relationship_user_type = 0
	} else {
		if relationship2.Type != 2 {
			_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship2.ID, bson.M{"$set": bson.M{"type": 0}})
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}

			relationship_user_type = 0
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, ctx.Conn.GetUserStatus(relationship_user.ID.Hex())), 0)
	ctx.WriteJSON(res)
	ctx.Conn.SendToUser(relationship_user.ID.Hex(), "RELATIONSHIP_MODIFY", response.NewRelationship(response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex())), relationship_user_type))
}

func ChangeRelationshipToFriend(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]
	relationshipsCollection := ctx.Db.Collection("relationships")

	relationship_user, statusCode := database.GetUser(relationship_id, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	relationship_user_type := 3

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

		if relationship1.Type == 1 || relationship1.Type == 3 || relationship1.Type == 4 {
			relationship_user_type = 1
		}

		_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": relationship_user_type}})
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	relationship_type := 4
	if relationship_user_type == 1 {
		relationship_type = 1
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
	ctx.Conn.SendToUser(relationship_user.ID.Hex(), "RELATIONSHIP_MODIFY", response.NewRelationship(response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex())), relationship_user_type))
}

func ChangeRelationshipToBlock(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]
	relationshipsCollection := ctx.Db.Collection("relationships")

	relationship_user, statusCode := database.GetUser(relationship_id, ctx.Db)
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
			Type:       2,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		_, err = relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": 2}})
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	relationship_user_type := 2

	var relationship2 database.Relationship
	err = relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": relationship_user.ID, "to_user_id": ctx.User.ID}).Decode(&relationship2)
	if err != nil {
		new_relationship := database.Relationship{
			ID:         primitive.NewObjectID(),
			FromUserID: relationship_user.ID,
			ToUserID:   ctx.User.ID,
			Type:       0,
		}

		_, err := relationshipsCollection.InsertOne(context.TODO(), new_relationship)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}

		relationship_user_type = 0
	} else {
		if relationship2.Type != 2 {
			_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship2.ID, bson.M{"$set": bson.M{"type": 0}})
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}

			relationship_user_type = 0
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, ctx.Conn.GetUserStatus(relationship_user.ID.Hex())), 2)
	ctx.WriteJSON(res)
	ctx.Conn.SendToUser(relationship_user.ID.Hex(), "RELATIONSHIP_MODIFY", response.NewRelationship(response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex())), relationship_user_type))
}
