package response

import "Chatapp/database"

type User struct {
	ID        string `json:"id"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	Status    int    `json:"status"`
	CreatedAt int64  `json:"created_at"`
}

func NewUser(user *database.User, status int) User {
	return User{
		ID:        user.ID.Hex(),
		Avatar:    user.Avatar,
		Username:  user.Username,
		Status:    status,
		CreatedAt: user.CreatedAt,
	}
}

func ErrorUser() User {
	return User{
		ID:        "00000000-0000-0000-0000-000000000000",
		Username:  "System",
		Avatar:    "",
		Status:    0,
		CreatedAt: 0,
	}
}
