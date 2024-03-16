package response

type Status struct {
	UserID    string `json:"user_id"`
	Status    int    `json:"status"`
	Type      int    `json:"type"`
	ChannelID string `json:"channel_id"`
}
