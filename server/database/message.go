package database

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateMessage(content string, channel_id string, user *Account, db *gorm.DB) (*Message, int) {

	_, dm_user, statusCode := GetDMChannel(channel_id, user, db)
	if statusCode != http.StatusOK {
		_, statusCode := GetChannel(channel_id, user, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}
	} else {
		checkBlock := Block{
			BlockedBy:   dm_user.ID,
			BlockedUser: user.ID,
		}
		db.Where(checkBlock).First(&checkBlock)
		if checkBlock.ID != 0 {
			return nil, http.StatusForbidden
		}

		checkBlock2 := Block{
			BlockedBy:   user.ID,
			BlockedUser: dm_user.ID,
		}
		db.Where(checkBlock2).First(&checkBlock2)
		if checkBlock2.ID != 0 {
			return nil, http.StatusForbidden
		}
	}

	new_message := Message{
		Uuid:      uuid.New().String(),
		Content:   content,
		AccountID: user.ID,
		ChannelID: channel_id,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&new_message)
	return &new_message, http.StatusOK
}

func EditMessage(uuid string, content string, user *Account, db *gorm.DB) (*Message, int) {
	var message Message
	db.Where("uuid = ?", uuid).First(&message)
	if message.ID == 0 {
		return nil, http.StatusNotFound
	}

	if message.AccountID != user.ID {
		return nil, http.StatusForbidden
	}

	_, _, statusCode := GetDMChannel(message.ChannelID, user, db)
	if statusCode != http.StatusOK {
		_, statusCode := GetChannel(message.ChannelID, user, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}
	}

	message.Content = content
	message.UpdatedAt = time.Now()
	db.Save(&message)
	return &message, http.StatusOK
}

func DeleteMessage(uuid string, user *Account, db *gorm.DB) (*Message, int) {
	var message Message
	db.Where("uuid = ?", uuid).First(&message)
	if message.ID == 0 {
		return nil, http.StatusNotFound
	}

	_, _, statusCode := GetDMChannel(message.ChannelID, user, db)
	if statusCode != http.StatusOK {
		channel, statusCode := GetChannel(message.ChannelID, user, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}

		if message.AccountID != user.ID && channel.Owner != user.Uuid {
			return nil, http.StatusForbidden
		}
	}

	db.Delete(&message)
	return &message, http.StatusOK
}

func GetMessage(uuid string, user *Account, db *gorm.DB) (*Message, int) {
	var message Message
	db.Where("uuid = ?", uuid).First(&message)
	if message.ID == 0 {
		return nil, http.StatusNotFound
	}

	_, _, statusCode := GetDMChannel(message.ChannelID, user, db)
	if statusCode != http.StatusOK {
		_, statusCode := GetChannel(message.ChannelID, user, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}
	}

	return &message, http.StatusOK
}

func GetMessages(channel_id string, user *Account, db *gorm.DB) ([]Message, int) {
	_, _, statusCode := GetDMChannel(channel_id, user, db)
	if statusCode != http.StatusOK {
		_, statusCode := GetChannel(channel_id, user, db)
		if statusCode != http.StatusOK {
			return nil, statusCode
		}
	}

	messages := []Message{}
	db.Where("channel_id = ?", channel_id).Find(&messages)
	return messages, http.StatusOK
}
