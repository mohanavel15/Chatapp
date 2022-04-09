package response

import "Chatapp/database"

type Ban struct {
	Uuid       string  `json:"uuid"`
	BannedBy   User    `json:"banned_by"`
	BannedUser User    `json:"banned_user"`
	Channel    Channel `json:"channel"`
	Reason     string  `json:"reason"`
	CreatedAt  int64   `json:"created_at"`
}

func NewBan(bannedBy User, BannedUser User, channel Channel, ban *database.Ban) Ban {
	return Ban{
		Uuid:       ban.Uuid,
		BannedBy:   bannedBy,
		BannedUser: BannedUser,
		Channel:    channel,
		Reason:     ban.Reason,
		CreatedAt:  ban.CreatedAt.Unix(),
	}
}
