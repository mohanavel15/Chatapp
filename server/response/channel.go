package response

import "Chatapp/database"

type Channel struct {
	Uuid           string `json:"uuid"`
	Icon           string `json:"icon"`
	Name           string `json:"name"`
	PrivateChannel bool   `json:"private_channel"`
	OwnerID        string `json:"owner_id"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

func NewChannel(channel *database.Channel) Channel {
	if channel.ID == 0 {
		return Channel{
			Uuid:           "00000000-0000-0000-0000-000000000000",
			Name:           "Unknown Channel",
			Icon:           "",
			PrivateChannel: false,
			OwnerID:        "00000000-0000-0000-0000-000000000000",
			CreatedAt:      "",
			UpdatedAt:      "",
		}
	}
	return Channel{
		Uuid:           channel.Uuid,
		Icon:           channel.Icon,
		Name:           channel.Name,
		PrivateChannel: channel.PrivateChannel,
		OwnerID:        channel.Owner,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}
}

type Channels []Channel

type Invite struct {
	InviteCode string `json:"invite_code"`
	CreatedAt  string `json:"created_at"`
}
