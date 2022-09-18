package database

import (
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (db *Database) GetRelationship(from primitive.ObjectID, to primitive.ObjectID) (*Relationship, int) {
	relationshipsCollection := db.mongo.Collection("relationships")

	var relationship Relationship
	err := relationshipsCollection.FindOne(context.TODO(), bson.M{"from_user_id": from, "to_user_id": to}).Decode(&relationship)
	if err != nil {
		return nil, http.StatusNotFound
	}

	return &relationship, http.StatusOK
}

func (db *Database) GetRelationships(user_id primitive.ObjectID) []Relationship {
	relationshipsCollection := db.mongo.Collection("relationships")

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
