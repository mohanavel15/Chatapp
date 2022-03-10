package request

type Signup struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Signin struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	ClientToken string `json:"client_token"`
}

type Signout struct {
	AccessToken string `json:"access_token"`
}
