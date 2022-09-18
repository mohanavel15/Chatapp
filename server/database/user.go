package database

import (
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (db *Database) GetUser(id string) (*User, int) {
	var user User
	users := db.Mongo.Collection("users")

	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, http.StatusBadRequest
	}

	err = users.FindOne(context.TODO(), bson.M{"_id": object_id}).Decode(&user)
	if err != nil {
		return nil, http.StatusNotFound
	}

	return &user, http.StatusOK
}
