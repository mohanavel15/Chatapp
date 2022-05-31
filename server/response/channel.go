package response

import "Chatapp/database"

type Channel struct {
	ID         string `json:"id"`
	Type       int    `json:"type"`
	Icon       string `json:"icon,omitempty"`
	Name       string `json:"name,omitempty"`
	OwnerID    string `json:"owner_id,omitempty"`
	Recipients []User `json:"recipients"`
	CreatedAt  int64  `json:"created_at"`
	UpdatedAt  int64  `json:"updated_at"`
}

func NewChannel(channel *database.Channel, recipients []User) Channel {
	res_channel := Channel{
		ID:         channel.ID.Hex(),
		Type:       channel.Type,
		Recipients: recipients,
		CreatedAt:  channel.CreatedAt,
		UpdatedAt:  channel.UpdatedAt,
	}
	if channel.Type == 2 {
		res_channel.Icon = channel.Icon
		res_channel.Name = channel.Name
		res_channel.OwnerID = channel.OwnerID.Hex()
	}
	return res_channel
}

type Channels []Channel

type Invite struct {
	InviteCode string `json:"invite_code"`
	CreatedAt  string `json:"created_at"`
}
