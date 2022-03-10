package response

type Channel struct {
	Uuid           string `json:"uuid"`
	Icon           string `json:"icon"`
	Name           string `json:"name"`
	PrivateChannel bool   `json:"private_channel"`
	OwnerID        string `json:"owner_id"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

type Channels []Channel

type Invite struct {
	InviteCode string `json:"invite_code"`
	CreatedAt  string `json:"created_at"`
}
