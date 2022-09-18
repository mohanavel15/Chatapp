package database

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (db *Database) CreateMessage(content string, channel_id string, system_message bool, user *User) (*Message, int) {
	var channel *Channel
	var statusCode int

	if system_message {
		channel, statusCode = db.GetChannelWithoutUser(channel_id)
	} else {
		channel, statusCode = db.GetChannel(channel_id, user)
	}

	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if channel.Type == 1 {
		for _, recipient := range channel.Recipients {
			if recipient.Hex() == user.ID.Hex() {
				continue
			}

			relationship1, statusCode := db.GetRelationship(recipient, user.ID)
			if statusCode == http.StatusNotFound {
				continue
			}
			if relationship1.Type == 2 {
				return nil, http.StatusForbidden
			}

			relationship2, statusCode := db.GetRelationship(user.ID, recipient)
			if statusCode == http.StatusNotFound {
				continue
			}
			if relationship2.Type == 2 {
				return nil, http.StatusForbidden
			}
		}
	}

	messages := db.mongo.Collection("messages")

	new_message := Message{
		ID:            primitive.NewObjectID(),
		Content:       content,
		ChannelID:     channel.ID,
		SystemMessage: system_message,
		CreatedAt:     time.Now().Unix(),
		UpdatedAt:     time.Now().Unix(),
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

func (db *Database) EditMessage(id string, channel_id string, content string, user *User) (*Message, int) {
	message, _, statusCode := db.GetMessage(id, channel_id, user)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if message.AccountID != user.ID {
		return nil, http.StatusForbidden
	}

	messages := db.mongo.Collection("messages")
	_, err := messages.UpdateOne(context.TODO(), bson.M{"_id": message.ID}, bson.M{"$set": bson.M{"content": content, "updated_at": time.Now().Unix()}})
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	message.Content = content
	message.UpdatedAt = time.Now().Unix()

	return message, http.StatusOK
}

func (db *Database) DeleteMessage(id string, channel_id string, user *User) (*Message, int) {
	message, channel, statusCode := db.GetMessage(id, channel_id, user)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if channel.Type == 1 && message.AccountID != user.ID {
		return nil, http.StatusForbidden
	}

	if channel.Type == 2 && message.AccountID != user.ID && channel.OwnerID != user.ID {
		return nil, http.StatusForbidden
	}

	messages := db.mongo.Collection("messages")
	_, err := messages.DeleteOne(context.TODO(), bson.M{"_id": message.ID})
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	return message, http.StatusOK
}

func (db *Database) GetMessage(id string, channel_id string, user *User) (*Message, *Channel, int) {
	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, nil, http.StatusBadRequest
	}

	channel, statusCode := db.GetChannel(channel_id, user)
	if statusCode != http.StatusOK {
		return nil, nil, statusCode
	}

	messages := db.mongo.Collection("messages")

	var message Message
	err = messages.FindOne(context.TODO(), bson.M{"_id": object_id}).Decode(&message)
	if err != nil {
		return nil, nil, http.StatusNotFound
	}

	return &message, channel, http.StatusOK
}

func (db *Database) GetMessages(channel_id string, limit int64, offset int64, user *User) ([]Message, int) {
	channel, statusCode := db.GetChannel(channel_id, user)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	messages := db.mongo.Collection("messages")
	cur, err := messages.Find(context.TODO(), bson.M{"channel_id": channel.ID}, options.Find().SetSort(bson.M{"created_at": -1}).SetLimit(limit).SetSkip(offset))
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
