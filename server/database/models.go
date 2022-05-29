package database

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id"`
	Avatar    string             `bson:"avatar"`
	Username  string             `bson:"username"`
	Email     string             `bson:"email"`
	Password  []byte             `bson:"password"`
	CreatedAt int64              `bson:"created_at"`
	UpdatedAt int64              `bson:"updated_at"`
}

type Session struct {
	ID          primitive.ObjectID `bson:"_id"`
	AccessToken string             `bson:"access_token"`
	ClientToken string             `bson:"client_token"`
	AccountID   primitive.ObjectID `bson:"account_id"`
}

type Friend struct {
	ID        primitive.ObjectID `bson:"_id"`
	FromUser  primitive.ObjectID `bson:"from_user"`
	ToUser    primitive.ObjectID `bson:"to_user"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
}

type Block struct {
	ID          primitive.ObjectID `bson:"_id"`
	BlockedUser primitive.ObjectID `bson:"blocked_user"`
	BlockedBy   primitive.ObjectID `bson:"blocked_by"`
	CreatedAt   time.Time          `bson:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at"`
}

type Message struct {
	ID        primitive.ObjectID `bson:"_id"`
	Content   string             `bson:"content"`
	ChannelID primitive.ObjectID `bson:"channel_id"`
	AccountID primitive.ObjectID `bson:"account_id"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
}

/*
type DMChannel struct {
	ID        uint   `gorm:"primarykey"`
	Uuid      string `gorm:"type:varchar(255);unique;not null"`
	FromUser  uint   `gorm:"type:int;not null"`
	ToUser    uint   `gorm:"type:int;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
*/

type Channel struct {
	ID        primitive.ObjectID `bson:"_id"`
	Type      int                `bson:"type"`
	Name      string             `bson:"name"`
	Icon      string             `bson:"icon"`
	OwnerID   primitive.ObjectID `bson:"owner_id"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
}

type Member struct {
	ID        primitive.ObjectID `bson:"_id"`
	ChannelID primitive.ObjectID `bson:"channel_id"`
	AccountID primitive.ObjectID `bson:"account_id"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
}

type Invites struct {
	ID         primitive.ObjectID `bson:"_id"`
	InviteCode string             `bson:"invite_code"`
	ChannelID  primitive.ObjectID `bson:"channel_id"`
	AccountID  primitive.ObjectID `bson:"account_id"`
	CreatedAt  time.Time          `bson:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at"`
}

type Ban struct {
	ID         primitive.ObjectID `bson:"_id"`
	BannedUser primitive.ObjectID `bson:"banned_user"`
	ChannelID  primitive.ObjectID `bson:"channel_id"`
	BannedBy   primitive.ObjectID `bson:"banned_by"`
	Reason     string             `bson:"reason"`
	CreatedAt  time.Time          `bson:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at"`
}

type Pins struct {
	ID        primitive.ObjectID `bson:"_id"`
	ChannelID primitive.ObjectID `bson:"channel_id"`
	MessageID primitive.ObjectID `bson:"message_id"`
	CreatedAt time.Time          `bson:"created_at"`
}
