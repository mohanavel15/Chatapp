package database

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateMessage(content string, channel_id string, system_message bool, user *User, db *mongo.Database) (*Message, int) {
	var channel *Channel
	var statusCode int

	if system_message {
		channel, statusCode = GetChannelWithoutUser(channel_id, db)
	} else {
		channel, statusCode = GetChannel(channel_id, user, db)
	}

	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if channel.Type == 1 {
		for _, recipient := range channel.Recipients {
			if recipient.Hex() == user.ID.Hex() {
				continue
			}

			relationship1, statusCode := GetRelationship(recipient, user.ID, db)
			if statusCode == http.StatusNotFound {
				continue
			}
			if relationship1.Type == 2 {
				return nil, http.StatusForbidden
			}

			relationship2, statusCode := GetRelationship(user.ID, recipient, db)
			if statusCode == http.StatusNotFound {
				continue
			}
			if relationship2.Type == 2 {
				return nil, http.StatusForbidden
			}
		}
	}

	messages := db.Collection("messages")

	new_message := Message{
		ID:        primitive.NewObjectID(),
		Content:   content,
		ChannelID: channel.ID,
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
	}

	if !system_message {
		new_message.AccountID = user.ID
	}

	_, err := messages.InsertOne(context.TODO(), new_message)
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	return &new_message, http.StatusOK
}

func EditMessage(id string, channel_id string, content string, user *User, db *mongo.Database) (*Message, int) {
	message, _, statusCode := GetMessage(id, channel_id, user, db)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if message.AccountID != user.ID {
		return nil, http.StatusForbidden
	}

	messages := db.Collection("messages")
	_, err := messages.UpdateOne(context.TODO(), bson.M{"_id": message.ID}, bson.M{"$set": bson.M{"content": content, "updated_at": time.Now().Unix()}})
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	message.Content = content
	message.UpdatedAt = time.Now().Unix()

	return message, http.StatusOK
}

func DeleteMessage(id string, channel_id string, user *User, db *mongo.Database) (*Message, int) {
	message, channel, statusCode := GetMessage(id, channel_id, user, db)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if channel.Type == 1 && message.AccountID != user.ID {
		return nil, http.StatusForbidden
	}

	if channel.Type == 2 && message.AccountID != user.ID && channel.OwnerID != user.ID {
		return nil, http.StatusForbidden
	}

	messages := db.Collection("messages")
	_, err := messages.DeleteOne(context.TODO(), bson.M{"_id": message.ID})
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	return message, http.StatusOK
}

func GetMessage(id string, channel_id string, user *User, db *mongo.Database) (*Message, *Channel, int) {
	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, nil, http.StatusBadRequest
	}

	channel, statusCode := GetChannel(channel_id, user, db)
	if statusCode != http.StatusOK {
		return nil, nil, statusCode
	}

	messages := db.Collection("messages")

	var message Message
	err = messages.FindOne(context.TODO(), bson.M{"_id": object_id}).Decode(&message)
	if err != nil {
		return nil, nil, http.StatusNotFound
	}

	return &message, channel, http.StatusOK
}

func GetMessages(channel_id string, user *User, db *mongo.Database) ([]Message, int) {
	channel, statusCode := GetChannel(channel_id, user, db)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	messages := db.Collection("messages")
	cur, err := messages.Find(context.TODO(), bson.M{"channel_id": channel.ID})
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	var messages_list []Message
	err = cur.All(context.TODO(), &messages_list)
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	return messages_list, http.StatusOK
}
