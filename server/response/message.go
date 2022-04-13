package response

type Message struct {
	Uuid      string `json:"uuid"`
	Content   string `json:"content"`
	Author    User   `json:"author"`
	ChannelID string `json:"channel_id"`
	CreatedAt int64  `json:"created_at"`
	EditedAt  int64  `json:"edited_at"`
}
