package response

type Friend struct {
	User
	Pending  bool `json:"pending"`
	Incoming bool `json:"incoming"`
}
