package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetRelationships(ctx *Context) {
	relationshipsCollection := ctx.Db.Collection("relationships")

	cursor, err := relationshipsCollection.Find(context.TODO(), bson.M{"from_user_id": ctx.User.ID})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	var relationships []response.Relationship

	for cursor.Next(context.TODO()) {
		var relationship database.Relationship
		cursor.Decode(&relationship)

		user, statusCode := database.GetUser(relationship.ToUserID.Hex(), ctx.Db)
		if statusCode != http.StatusOK {
			continue
		}

		res_user := response.NewUser(user, ctx.Conn.GetUserStatus(user.ID.Hex()))
		relationships = append(relationships, response.NewRelationship(res_user, relationship.Type))
	}

	res, err := json.Marshal(relationships)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func GetRelationship(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	relationship_id := url_vars["rid"]

	relationshipsCollection := ctx.Db.Collection("relationships")

	var relationship database.Relationship
	err := relationshipsCollection.FindOne(context.TODO(), bson.M{"fom_user_id": ctx.User.ID, "to_user_id": relationship_id}).Decode(&relationship)
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

	res, err := json.Marshal(res_relationship)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
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
	} else {
		if relationship2.Type != 2 {
			_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": 0}})
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, ctx.Conn.GetUserStatus(relationship_user.ID.Hex())), 0)
	res_json, err := json.Marshal(res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res_json)
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
	res_json, err := json.Marshal(res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res_json)
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
	} else {
		if relationship2.Type != 2 {
			_, err := relationshipsCollection.UpdateByID(context.TODO(), relationship1.ID, bson.M{"$set": bson.M{"type": 0}})
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}
		}
	}

	res := response.NewRelationship(response.NewUser(relationship_user, ctx.Conn.GetUserStatus(relationship_user.ID.Hex())), 2)
	res_json, err := json.Marshal(res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res_json)
}
