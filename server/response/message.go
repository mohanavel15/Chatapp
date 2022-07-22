package response

import (
	"Chatapp/database"
	"fmt"
)

type Message struct {
	ID            string       `json:"id"`
	Content       string       `json:"content"`
	Author        User         `json:"author"`
	ChannelID     string       `json:"channel_id"`
	SystemMessage bool         `json:"system_message"`
	CreatedAt     int64        `json:"created_at"`
	EditedAt      int64        `json:"edited_at"`
	Attachments   []Attachment `json:"attachments"`
}

func NewMessage(message *database.Message, user User) Message {
	res_message := Message{
		ID:            message.ID.Hex(),
		Content:       message.Content,
		ChannelID:     message.ChannelID.Hex(),
		SystemMessage: message.SystemMessage,
		CreatedAt:     message.CreatedAt,
		EditedAt:      message.UpdatedAt,
		Attachments:   []Attachment{},
	}

	if !message.SystemMessage {
		res_message.Author = user
	}

	if len(message.Attachments) > 0 {
		res_attachments := NewAttachments(message)
		res_message.Attachments = res_attachments
	}

	return res_message
}

type Attachment struct {
	ID          string `json:"id"`
	Filename    string `json:"filename"`
	Size        int64  `json:"size"`
	ContentType string `json:"content_type"`
	Url         string `json:"url"`
}

func NewAttachments(message *database.Message) []Attachment {
	res_attachments := []Attachment{}
	for _, attachment := range message.Attachments {
		url := fmt.Sprintf("http://127.0.0.1:5000/attachments/%s/%s/%s/%s", message.ChannelID.Hex(), message.ID.Hex(), attachment.ID.Hex(), attachment.Filename)
		res_attachment := Attachment{
			ID:          attachment.ID.Hex(),
			Filename:    attachment.Filename,
			Size:        attachment.Size,
			ContentType: attachment.ContentType,
			Url:         url,
		}
		res_attachments = append(res_attachments, res_attachment)
	}

	return res_attachments
}
