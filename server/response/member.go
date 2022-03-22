package response

type Member struct {
	Uuid      string `json:"uuid"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	Is_Owner  bool   `json:"is_owner"`
	Status    int    `json:"status"`
	ChannelID string `json:"channel_id"`
	JoinedAt  string `json:"joined_at"`
	CreatedAt string `json:"created_at"`
}
