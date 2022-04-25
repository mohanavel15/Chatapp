package response

import "Chatapp/database"

type Member struct {
	Uuid      string `json:"uuid"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	Is_Owner  bool   `json:"is_owner"`
	Status    int    `json:"status"`
	ChannelID string `json:"channel_id"`
	JoinedAt  int64  `json:"joined_at"`
	CreatedAt int64  `json:"created_at"`
}

func NewMember(user *User, channel *database.Channel, member *database.Member) Member {
	return Member{
		Uuid:      user.Uuid,
		Avatar:    user.Avatar,
		Username:  user.Username,
		Is_Owner:  channel.Owner == user.Uuid,
		Status:    user.Status,
		ChannelID: channel.Uuid,
		JoinedAt:  member.CreatedAt.Unix(),
		CreatedAt: user.CreatedAt,
	}
}
