package database

import (
	"net/http"

	"gorm.io/gorm"
)

func GetUser(uuid string, db *gorm.DB) (*Account, int) {
	var user Account
	db.Where("uuid = ?", uuid).First(&user)

	if user.ID == 0 {
		return nil, http.StatusNotFound
	}

	return &user, http.StatusOK
}
