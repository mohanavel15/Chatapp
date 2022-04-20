package response

import "Chatapp/database"

type Message struct {
	Uuid      string `json:"uuid"`
	Content   string `json:"content"`
	Author    User   `json:"author"`
	ChannelID string `json:"channel_id"`
	CreatedAt int64  `json:"created_at"`
	EditedAt  int64  `json:"edited_at"`
}

func NewMessage(message *database.Message, user User) Message {
	return Message{
		Uuid:      message.Uuid,
		Content:   message.Content,
		Author:    user,
		ChannelID: message.ChannelID,
		CreatedAt: message.CreatedAt.Unix(),
		EditedAt:  message.UpdatedAt.Unix(),
	}
}
