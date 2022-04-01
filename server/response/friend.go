package response

type Friend struct {
	User     User `json:"user"`
	Pending  bool `json:"pedding"`
	Incoming bool `json:"incoming"`
}
