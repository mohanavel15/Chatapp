package response

import "Chatapp/pkg/database"

type Ban struct {
	ID         string `json:"id"`
	BannedBy   User   `json:"banned_by"`
	BannedUser User   `json:"banned_user"`
	ChannelID  string `json:"channel_id"`
	Reason     string `json:"reason"`
	CreatedAt  int64  `json:"created_at"`
}

func NewBan(bannedBy User, BannedUser User, channel_id string, ban *database.Ban) Ban {
	return Ban{
		ID:         ban.ID.Hex(),
		BannedBy:   bannedBy,
		BannedUser: BannedUser,
		ChannelID:  channel_id,
		Reason:     ban.Reason,
		CreatedAt:  ban.CreatedAt,
	}
}
