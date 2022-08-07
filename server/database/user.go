package database

import (
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetUser(id string, db *mongo.Database) (*User, int) {
	var user User
	users := db.Collection("users")

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
