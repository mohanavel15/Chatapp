package response

type Friend struct {
	User     User `json:"user"`
	Pending  bool `json:"pending"`
	Incoming bool `json:"incoming"`
}
