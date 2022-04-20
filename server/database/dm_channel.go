package database

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetDMChannels(user *Account, db *gorm.DB) []DMChannel {
	dm_channels1 := []DMChannel{}
	dm_channels2 := []DMChannel{}
	db.Where("from_user = ?", user.ID).Find(&dm_channels1)
	db.Where("to_user = ?", user.ID).Find(&dm_channels2)

	dm_channels := []DMChannel{}
	dm_channels = append(dm_channels, dm_channels1...)
	dm_channels = append(dm_channels, dm_channels2...)
	return dm_channels
}

func GetDMChannel(uuid string, user *Account, db *gorm.DB) (*DMChannel, *Account, int) {
	var dm_channel DMChannel
	db.Where("uuid = ?", uuid).First(&dm_channel)

	if dm_channel.ID == 0 {
		return nil, nil, http.StatusNotFound
	}

	if dm_channel.FromUser != user.ID && dm_channel.ToUser != user.ID {
		return nil, nil, http.StatusNotFound
	}

	var dm_user Account
	if dm_channel.FromUser != user.ID {
		db.Where("id = ?", dm_channel.FromUser).First(&dm_user)
	} else {
		db.Where("id = ?", dm_channel.ToUser).First(&dm_user)
	}

	if dm_user.ID == 0 {
		return nil, nil, http.StatusNotFound
	}

	return &dm_channel, &dm_user, http.StatusOK
}

func GetUserDM(dm_user_id string, user *Account, db *gorm.DB) (*DMChannel, *Account, int) {
	dm_user, err := GetUser(dm_user_id, db)
	if err != http.StatusOK {
		return nil, nil, err
	}

	var dm_channel DMChannel
	db.Where("from_user = ? AND to_user = ?", user.ID, dm_user.ID).First(&dm_channel)
	if dm_channel.ID == 0 {
		db.Where("from_user = ? AND to_user = ?", dm_user.ID, user.ID).First(&dm_channel)
	}

	if dm_channel.ID == 0 {
		dm_channel = DMChannel{
			Uuid:      uuid.New().String(),
			FromUser:  user.ID,
			ToUser:    dm_user.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		db.Create(&dm_channel)
	}

	return &dm_channel, dm_user, http.StatusOK
}
