package response

import "Chatapp/database"

type Message struct {
	Uuid        string       `json:"uuid"`
	Content     string       `json:"content"`
	Author      User         `json:"author"`
	ChannelID   string       `json:"channel_id"`
	CreatedAt   int64        `json:"created_at"`
	EditedAt    int64        `json:"edited_at"`
	Attachments []Attachment `json:"attachments"`
}

func NewMessage(message *database.Message, user User) Message {
	return Message{
		Uuid:        message.Uuid,
		Content:     message.Content,
		Author:      user,
		ChannelID:   message.ChannelID,
		CreatedAt:   message.CreatedAt.Unix(),
		EditedAt:    message.UpdatedAt.Unix(),
		Attachments: []Attachment{},
	}
}

type Attachment struct {
	Uuid        string `json:"uuid"`
	Name        string `json:"name"`
	Size        int64  `json:"size"`
	ContentType string `json:"content_type"`
	Url         string `json:"url"`
}
