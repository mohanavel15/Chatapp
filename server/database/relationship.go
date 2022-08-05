package database

import (
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetRelationship(from primitive.ObjectID, to primitive.ObjectID, db *mongo.Database) (*Relationship, int) {
	relationshipsCollection := db.Collection("relationships")

	var relationship Relationship
	err := relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": from, "to_user_id": to}).Decode(&relationship)
	if err != nil {
		return nil, http.StatusNotFound
	}

	return &relationship, http.StatusOK
}

func GetRelationships(user_id primitive.ObjectID, db *mongo.Database) []Relationship {
	relationshipsCollection := db.Collection("relationships")

	cursor, err := relationshipsCollection.Find(context.TODO(), bson.M{"from_user_id": user_id})
	if err != nil {
		return []Relationship{}
	}

	var relationships []Relationship

	for cursor.Next(context.TODO()) {
		var relationship Relationship
		cursor.Decode(&relationship)

		relationships = append(relationships, relationship)
	}

	return relationships
}
