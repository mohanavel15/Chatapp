package request

type Channel struct {
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	RecipientID string `json:"recipient_id"`
}

type EditChannel struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
}
