package request

type Signup struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Signin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type ChangePassword struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type ForgotPassword struct {
	Email string `json:"email"`
}

type ResetPassword struct {
	Password string `json:"password"`
	Token    string `json:"token"`
}
