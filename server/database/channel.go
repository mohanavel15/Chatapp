package database

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateChannel(name string, icon string, user *Account, db *gorm.DB) *Channel {
	channel := Channel{
		Uuid:      uuid.New().String(),
		Name:      name,
		Icon:      icon,
		Owner:     user.Uuid,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&channel)

	members := Member{
		ChannelID: channel.ID,
		AccountID: user.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&members)

	return &channel
}

func ModifyChannel(uuid string, name string, icon string, user *Account, db *gorm.DB) (*Channel, int) {
	var channel Channel
	db.Where("uuid = ?", uuid).First(&channel)

	if channel.ID == 0 {
		return nil, http.StatusNotFound
	}

	if channel.Owner != user.Uuid {
		return nil, http.StatusForbidden
	}

	if name != "" {
		channel.Name = name
	}

	if icon != "" {
		channel.Icon = icon
	}

	channel.UpdatedAt = time.Now()
	db.Save(&channel)

	return &channel, http.StatusOK
}

func DeleteChannel(uuid string, user *Account, db *gorm.DB) (*Channel, *Member, int) {
	var channel Channel
	db.Where("uuid = ?", uuid).First(&channel)

	if channel.ID == 0 {
		return nil, nil, http.StatusNotFound
	}

	var member Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)
	if member.ID == 0 {
		return nil, nil, http.StatusNotFound
	}

	db.Delete(&member)

	return &channel, &member, http.StatusOK
}

func GetChannel(uuid string, user *Account, db *gorm.DB) (*Channel, int) {
	var channel Channel
	db.Where("uuid = ?", uuid).First(&channel)

	if channel.ID == 0 {
		return nil, http.StatusNotFound
	}

	var member Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)
	if member.ID == 0 {
		return nil, http.StatusNotFound
	}

	return &channel, http.StatusOK
}

func GetChannels(user *Account, db *gorm.DB) []Channel {
	var member_of []Member
	db.Where("account_id = ?", user.ID).Find(&member_of)

	var channels []Channel
	for _, member := range member_of {
		var channel Channel
		db.Where("id = ?", member.ChannelID).First(&channel)
		channels = append(channels, channel)
	}

	return channels
}
