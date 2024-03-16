package database

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID         primitive.ObjectID `bson:"_id"`
	Avatar     Avatar             `bson:"avatar"`
	Username   string             `bson:"username"`
	Email      string             `bson:"email"`
	Password   []byte             `bson:"password"`
	CreatedAt  int64              `bson:"created_at"`
	LastLogout int64              `bson:"last_logout"`
}

type Avatar struct {
	ID     primitive.ObjectID `bson:"_id"`
	Avatar string             `bson:"avatar"`
	Type   string             `bson:"type"`
	Ext    string             `bson:"ext"`
}

type Relationship struct {
	ID         primitive.ObjectID `bson:"_id"`
	Type       int                `bson:"type"`
	FromUserID primitive.ObjectID `bson:"from_user_id"`
	ToUserID   primitive.ObjectID `bson:"to_user_id"`
}

type Channel struct {
	ID         primitive.ObjectID   `bson:"_id,omitempty"`
	Type       int                  `bson:"type,omitempty"`
	Name       string               `bson:"name,omitempty"`
	Icon       Icon                 `bson:"icon,omitempty"`
	OwnerID    primitive.ObjectID   `bson:"owner_id,omitempty"`
	Recipients []primitive.ObjectID `bson:"recipients,omitempty"`
	CreatedAt  int64                `bson:"created_at,omitempty"`
	UpdatedAt  int64                `bson:"updated_at,omitempty"`
}

type Icon struct {
	ID   primitive.ObjectID `bson:"_id"`
	Icon string             `bson:"icon"`
	Type string             `bson:"type"`
	Ext  string             `bson:"ext"`
}

type Message struct {
	ID            primitive.ObjectID `bson:"_id"`
	Content       string             `bson:"content"`
	ChannelID     primitive.ObjectID `bson:"channel_id"`
	AccountID     primitive.ObjectID `bson:"account_id"`
	SystemMessage bool               `bson:"system_message"`
	CreatedAt     int64              `bson:"created_at"`
	UpdatedAt     int64              `bson:"updated_at"`
	Attachments   []Attachment       `bson:"attachments,omitempty"`
}

type Attachment struct {
	ID          primitive.ObjectID `bson:"_id"`
	Filename    string             `bson:"filename"`
	Size        int64              `bson:"size"`
	ContentType string             `bson:"content-type"`
	Data        []byte             `bson:"data"`
}

type Pins struct {
	ID        primitive.ObjectID `bson:"_id"`
	ChannelID primitive.ObjectID `bson:"channel_id"`
	MessageID primitive.ObjectID `bson:"message_id"`
	CreatedAt int64              `bson:"created_at"`
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
	CreatedAt  int64              `bson:"created_at"`
}
