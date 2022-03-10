package response

type Message struct {
	Uuid      string  `json:"uuid"`
	Content   string  `json:"content"`
	Author    User    `json:"author"`
	Channel   Channel `json:"channel"`
	CreatedAt string  `json:"created_at"`
	EditedAt  string  `json:"edited_at"`
}
