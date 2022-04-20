package response

import "Chatapp/database"

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

func NewMember(user *database.Account, channel *database.Channel, member *database.Member) Member {
	return Member{
		Uuid:      user.Uuid,
		Avatar:    user.Avatar,
		Username:  user.Username,
		Is_Owner:  channel.Owner == user.Uuid,
		Status:    1,
		ChannelID: channel.Uuid,
		JoinedAt:  member.CreatedAt.String(),
		CreatedAt: user.CreatedAt.String(),
	}
}
