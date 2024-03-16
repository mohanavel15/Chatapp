package response

import (
	"Chatapp/pkg/database"
	"fmt"
)

type Channel struct {
	ID         string `json:"id"`
	Type       int    `json:"type"`
	Icon       string `json:"icon"`
	Name       string `json:"name"`
	OwnerID    string `json:"owner_id"`
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
		res_channel.Icon = GetIconUrl(channel)
		res_channel.Name = channel.Name
		res_channel.OwnerID = channel.OwnerID.Hex()
	}
	return res_channel
}

func GetIconUrl(channel *database.Channel) string {
	endpoint := fmt.Sprint(channel.ID.Hex(), "/", channel.Icon.ID.Hex(), "/unknown."+channel.Icon.Ext)
	fullUrl := fmt.Sprintf("%s/icons/%s", URL, endpoint)
	return fullUrl
}

type Invite struct {
	InviteCode string `json:"invite_code"`
	CreatedAt  string `json:"created_at"`
}
