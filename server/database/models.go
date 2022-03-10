package database

import (
	"time"
)

type Account struct {
	ID        uint   `gorm:"primarykey"`
	Uuid      string `gorm:"type:varchar(255);unique;not null"`
	Avatar    string `gorm:"type:varchar(255)"`
	Username  string `gorm:"type:varchar(25);unique;not null"`
	Email     string `gorm:"type:varchar(255);unique;not null"`
	Password  string `gorm:"type:varchar(255);not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Session struct {
	ID          uint   `gorm:"primary_key"`
	Uuid        string `gorm:"type:varchar(255);not null"`
	AccessToken string `gorm:"type:varchar(255);unique;not null"`
	ClientToken string `gorm:"type:varchar(255);unique;not null"`
	AccountID   uint   `gorm:"type:int;not null"`
}

type Message struct {
	ID        uint   `gorm:"primarykey"`
	Uuid      string `gorm:"type:varchar(255);not null"`
	Content   string `gorm:"type:varchar(255);not null"`
	ChannelID uint   `gorm:"type:int;not null"`
	AccountID uint   `gorm:"type:int;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Channel struct {
	ID             uint   `gorm:"primarykey"`
	Uuid           string `gorm:"type:varchar(255);unique;not null"`
	Name           string `gorm:"type:varchar(255);not null"`
	Icon           string `gorm:"type:varchar(255);not null"`
	Owner          string `gorm:"type:varchar(255);not null"`
	PrivateChannel bool   `gorm:"type:boolean;not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type Member struct {
	ID        uint `gorm:"primarykey"`
	ChannelID uint `gorm:"type:int;not null"`
	AccountID uint `gorm:"type:int;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Invites struct {
	ID         uint   `gorm:"primarykey"`
	InviteCode string `gorm:"type:varchar(255);unique;not null"`
	ChannelID  uint   `gorm:"type:int;not null"`
	AccountID  uint   `gorm:"type:int;not null"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
