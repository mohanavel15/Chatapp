package request

type KickorBan struct {
	Ban    bool   `json:"ban"`
	Reason string `json:"reason"`
}
