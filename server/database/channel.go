package database

import "gorm.io/gorm"

func GetAllChannels(db *gorm.DB, user Account) []Channel {
	members := []Member{}
	db.Where("user_id = ?", user.Uuid).Find(&members)
	channels := []Channel{}
	for _, member := range members {
		var channel Channel
		db.Where("id = ?", member.ChannelID).Find(&channel)
		channels = append(channels, channel)
	}
	return channels
}

func GetAllDmChannels(db *gorm.DB, user Account) []DMChannel {
	dm_channels1 := []DMChannel{}
	dm_channels2 := []DMChannel{}
	db.Where("from_user = ?", user.ID).Find(&dm_channels1)
	db.Where("to_user = ?", user.ID).Find(&dm_channels2)

	dm_channels := []DMChannel{}
	dm_channels = append(dm_channels, dm_channels1...)
	dm_channels = append(dm_channels, dm_channels2...)
	return dm_channels
}
