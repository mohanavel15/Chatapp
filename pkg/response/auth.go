package response

type Signin_Response struct {
	AccessToken string `json:"access_token"`
	ClientToken string `json:"client_token"`
}
