package database

import "gorm.io/gorm"

func GetAllMessages(db *gorm.DB, channel_id string) []Message {
	messages := []Message{}
	db.Where("channel_id = ?", channel_id).Find(&messages)
	return messages
}
