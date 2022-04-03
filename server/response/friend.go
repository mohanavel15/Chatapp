package response

type Friend struct {
	User
	Status   int  `json:"status"`
	Pending  bool `json:"pending"`
	Incoming bool `json:"incoming"`
}
