package request

type RemoveRecipient struct {
	IsBan  bool   `json:"isban"`
	Reason string `json:"reason"`
}
