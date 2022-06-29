package request

type RemoveRecipient struct {
	IsBan  bool   `json:"is_ban"`
	Reason string `json:"reason"`
}
