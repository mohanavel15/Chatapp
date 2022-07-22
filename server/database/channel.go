package database

import (
	"context"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func CreateChannel(name string, icon string, recipient_id string, user *User, db *mongo.Database) (*Channel, int) {
	channels := db.Collection("channels")

	if recipient_id != "" {
		recipient, statusCode := GetUser(recipient_id, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}

		var channel Channel
		err := channels.FindOne(context.TODO(), bson.M{
			"type": 1,
			"$or": []bson.M{
				{"recipients": []primitive.ObjectID{user.ID, recipient.ID}},
				{"recipients": []primitive.ObjectID{recipient.ID, user.ID}},
			},
		}).Decode(&channel)
		if err == nil {
			return &channel, http.StatusOK
		}

		channel = Channel{
			ID:   primitive.NewObjectID(),
			Type: 1,
			Recipients: []primitive.ObjectID{
				user.ID,
				recipient.ID,
			},
			CreatedAt: time.Now().Unix(),
			UpdatedAt: time.Now().Unix(),
		}

		_, err = channels.InsertOne(context.TODO(), channel)
		if err != nil {
			return nil, http.StatusInternalServerError
		}

		return &channel, http.StatusOK
	} else {
		//Icon:    icon,
		channel := Channel{
			ID:      primitive.NewObjectID(),
			Type:    2,
			Name:    name,
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

	channel, statusCode := GetChannel(id, user, db)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if channel.Type == 1 || channel.OwnerID != user.ID {
		return nil, http.StatusForbidden
	}

	if name != "" {
		channel.Name = name
	}

	if icon != "" {
		file_type_regx := regexp.MustCompile("image/(png|jpeg|gif)")
		file_ext_regx := regexp.MustCompile("png|jpeg|gif")

		file_type := file_type_regx.FindString(icon)
		if file_type == "" {
			return nil, http.StatusBadRequest
		}

		file_ext := file_ext_regx.FindString(file_type)

		iconBS64 := icon[strings.Index(icon, ",")+1:]

		newIcon := Icon{
			ID:   primitive.NewObjectID(),
			Type: file_type,
			Ext:  file_ext,
			Icon: iconBS64,
		}

		channel.Icon = newIcon
	}

	channel.UpdatedAt = time.Now().Unix()

	_, err := channels.ReplaceOne(context.TODO(), bson.M{"_id": channel.ID}, channel)
	if err != nil {
		return nil, http.StatusInternalServerError
	}

	return channel, http.StatusOK
}

func DeleteChannel(id string, user *User, db *mongo.Database) (*Channel, int) {
	channelsCollection := db.Collection("channels")

	channel, statusCode := GetChannel(id, user, db)
	if statusCode != http.StatusOK {
		return nil, statusCode
	}

	if channel.Type == 1 {
		return nil, http.StatusForbidden
	}

	rd := options.After
	result := channelsCollection.FindOneAndUpdate(context.TODO(), bson.M{"_id": channel.ID}, bson.M{"$pull": bson.M{"recipients": user.ID}}, &options.FindOneAndUpdateOptions{ReturnDocument: &rd})
	if result.Err() != nil {
		return nil, http.StatusInternalServerError
	}

	result.Decode(&channel)
	return channel, http.StatusOK
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

func GetChannelWithoutUser(id string, db *mongo.Database) (*Channel, int) {
	channelsCollection := db.Collection("channels")
	object_id, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, http.StatusBadRequest
	}

	var channel Channel
	err = channelsCollection.FindOne(context.TODO(), bson.M{"_id": object_id}).Decode(&channel)
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
