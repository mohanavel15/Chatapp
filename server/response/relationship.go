package response

type Relationship struct {
	User
	Type int `json:"type"`
}

func NewRelationship(user User, type_ int) Relationship {
	return Relationship{
		User: user,
		Type: type_,
	}
}
