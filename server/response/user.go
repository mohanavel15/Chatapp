package response

type User struct {
	Uuid      string `json:"uuid"`
	Avatar    string `json:"avatar"`
	Username  string `json:"username"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
