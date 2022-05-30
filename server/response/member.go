package response

import "Chatapp/database"

type Member struct {
	User
	Is_Owner  bool   `json:"is_owner"`
	ChannelID string `json:"channel_id"`
	JoinedAt  int64  `json:"joined_at"`
}

func NewMember(user *User, channel *database.Channel, member *database.Member) Member {
	return Member{
		User:      *user,
		Is_Owner:  channel.OwnerID.Hex() == user.ID,
		ChannelID: channel.ID.Hex(),
		JoinedAt:  member.CreatedAt.Unix(),
	}
}
