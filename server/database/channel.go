package database

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateChannel(name string, icon string, recipient_id string, user *User, db *mongo.Database) (*Channel, int) {
	channels := db.Collection("channels")

	if recipient_id != "" {
		recipient, statusCode := GetUser(recipient_id, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}

		channel := Channel{
			ID:   primitive.NewObjectID(),
			Type: 1,
			Recipients: []primitive.ObjectID{
				user.ID,
				recipient.ID,
			},
			CreatedAt: time.Now().Unix(),
			UpdatedAt: time.Now().Unix(),
		}

		_, err := channels.InsertOne(context.TODO(), channel)
		if err != nil {
			return nil, http.StatusInternalServerError
		}

		return &channel, http.StatusOK
	} else {
		channel := Channel{
			ID:      primitive.NewObjectID(),
			Type:    2,
			Name:    name,
			Icon:    icon,
			OwnerID: user.ID,
			Recipients: []primitive.ObjectID{
				user.ID,
			},
			CreatedAt: time.Now().Unix(),
			UpdatedAt: time.Now().Unix(),
		}
		_, err := channels.InsertOne(context.TODO(), channel)
		if err != nil {
			return nil, http.StatusInternalServerError
		}

		return &channel, http.StatusOK
	}
}

func ModifyChannel(id string, name string, icon string, user *User, db *mongo.Database) (*Channel, int) {
	channels := db.Collection("channels")
	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, http.StatusBadRequest
	}

	var channel Channel
	err = channels.FindOne(context.TODO(), bson.M{"id": object_id}).Decode(&channel)
	if err != nil {
		return nil, http.StatusNotFound
	}

	if channel.Type == 1 || channel.OwnerID != user.ID {
		return nil, http.StatusForbidden
	}

	if name != "" {
		channel.Name = name
	}

	if icon != "" {
		channel.Icon = icon
	}

	channel.UpdatedAt = time.Now().Unix()

	_, err = channels.ReplaceOne(context.TODO(), bson.M{"id": object_id}, channel)
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	return &channel, http.StatusOK
}

func DeleteChannel(id string, user *User, db *mongo.Database) (*Channel, int) {
	channelsCollection := db.Collection("channels")
	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, http.StatusBadRequest
	}

	var channel Channel
	err = channelsCollection.FindOne(context.TODO(), bson.M{"id": object_id}).Decode(&channel)
	if err != nil {
		return nil, http.StatusNotFound
	}

	if channel.Type == 1 {
		return nil, http.StatusForbidden
	}

	recipients := []primitive.ObjectID{}
	for _, recipient := range channel.Recipients {
		if recipient.Hex() != user.ID.Hex() {
			recipients = append(recipients, recipient)
		}
	}

	_, err = channelsCollection.UpdateOne(context.TODO(), bson.M{"id": object_id}, bson.M{"$set": bson.M{"recipients": recipients}})
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	channel.Recipients = recipients
	return &channel, http.StatusOK
}

func GetChannel(id string, user *User, db *mongo.Database) (*Channel, int) {
	channelsCollection := db.Collection("channels")
	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, http.StatusBadRequest
	}

	var channel Channel
	err = channelsCollection.FindOne(context.TODO(), bson.M{"_id": object_id, "recipients": user.ID}).Decode(&channel)
	if err != nil {
		return nil, http.StatusNotFound
	}

	return &channel, http.StatusOK
}

func GetChannels(user *User, db *mongo.Database) []Channel {
	channelsCollection := db.Collection("channels")

	var channels []Channel
	cursor, err := channelsCollection.Find(context.TODO(), bson.M{"recipients": user.ID})
	if err != nil {
		fmt.Println(err)
		return []Channel{}
	}

	for cursor.Next(context.TODO()) {
		var channel Channel
		cursor.Decode(&channel)
		channels = append(channels, channel)
	}

	return channels
}
