package response

import "Chatapp/database"

type Ban struct {
	ID         string  `json:"id"`
	BannedBy   User    `json:"banned_by"`
	BannedUser User    `json:"banned_user"`
	Channel    Channel `json:"channel"`
	Reason     string  `json:"reason"`
	CreatedAt  int64   `json:"created_at"`
}

func NewBan(bannedBy User, BannedUser User, channel Channel, ban *database.Ban) Ban {
	return Ban{
		ID:         ban.ID.Hex(),
		BannedBy:   bannedBy,
		BannedUser: BannedUser,
		Channel:    channel,
		Reason:     ban.Reason,
		CreatedAt:  ban.CreatedAt.Unix(),
	}
}
