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
	if channel.Type == 1 {
		return Channel{
			ID:         channel.ID.Hex(),
			Type:       channel.Type,
			Recipients: recipients,
			CreatedAt:  channel.CreatedAt,
			UpdatedAt:  channel.UpdatedAt,
		}
	} else if channel.Type == 2 {
		return Channel{
			ID:         channel.ID.Hex(),
			Type:       channel.Type,
			Icon:       channel.Icon,
			Name:       channel.Name,
			OwnerID:    channel.OwnerID.Hex(),
			Recipients: recipients,
			CreatedAt:  channel.CreatedAt,
			UpdatedAt:  channel.UpdatedAt,
		}
	} else {
		return Channel{}
	}
}

type Channels []Channel

type Invite struct {
	InviteCode string `json:"invite_code"`
	CreatedAt  string `json:"created_at"`
}
