package response

type User struct {
	Uuid      string `json:"uuid"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	CreatedAt int64  `json:"created_at"`
}
