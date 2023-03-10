package response

import (
	"Chatapp/pkg/database"
	"fmt"
)

type User struct {
	ID        string `json:"id"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	Status    int    `json:"status"`
	CreatedAt int64  `json:"created_at"`
}

func GetUrl(user *database.User) string {
	endpoint := fmt.Sprint(user.ID.Hex(), "/", user.Avatar.ID.Hex(), "/unknown."+user.Avatar.Ext)
	fullUrl := fmt.Sprintf("%s/avatars/%s", URL, endpoint)
	return fullUrl
}

func NewUser(user *database.User, status int) User {
	return User{
		ID:        user.ID.Hex(),
		Avatar:    GetUrl(user),
		Username:  user.Username,
		Status:    status,
		CreatedAt: user.CreatedAt,
	}
}
