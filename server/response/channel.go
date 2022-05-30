package response

import "Chatapp/database"

type Channel struct {
	ID         string `json:"id"`
	Icon       string `json:"icon"`
	Name       string `json:"name"`
	OwnerID    string `json:"owner_id"`
	Recipients []User `json:"recipients"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

func NewChannel(channel *database.Channel) Channel {
	return Channel{
		ID:        channel.ID.Hex(),
		Icon:      channel.Icon,
		Name:      channel.Name,
		OwnerID:   channel.OwnerID.Hex(),
		CreatedAt: channel.CreatedAt.String(),
		UpdatedAt: channel.UpdatedAt.String(),
	}
}

type Channels []Channel

type Invite struct {
	InviteCode string `json:"invite_code"`
	CreatedAt  string `json:"created_at"`
}
