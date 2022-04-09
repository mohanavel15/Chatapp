package response

import "Chatapp/database"

type User struct {
	Uuid      string `json:"uuid"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	CreatedAt int64  `json:"created_at"`
}

func NewUser(user *database.Account) User {
	if user.ID == 0 {
		return User{
			Uuid:      "00000000-0000-0000-0000-000000000000",
			Username:  "Unknown User",
			Avatar:    "",
			CreatedAt: 0,
		}
	}
	return User{
		Uuid:      user.Uuid,
		Avatar:    user.Avatar,
		Username:  user.Username,
		CreatedAt: user.CreatedAt.Unix(),
	}
}
