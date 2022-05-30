package response

import "Chatapp/database"

type Message struct {
	ID          string       `json:"id"`
	Content     string       `json:"content"`
	Author      User         `json:"author"`
	ChannelID   string       `json:"channel_id"`
	CreatedAt   int64        `json:"created_at"`
	EditedAt    int64        `json:"edited_at"`
	Attachments []Attachment `json:"attachments"`
}

func NewMessage(message *database.Message, user User) Message {
	return Message{
		ID:          message.ID.Hex(),
		Content:     message.Content,
		Author:      user,
		ChannelID:   message.ChannelID.Hex(),
		CreatedAt:   message.CreatedAt,
		EditedAt:    message.UpdatedAt,
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
