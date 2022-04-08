
export interface MessageOBJ {
    uuid:           string
    content:        string
    author:         UserOBJ
    channel:        ChannelOBJ
    created_at:     string
    updated_at:     string
}

export interface ChannelOBJ {
    uuid:       string
    name:       string
    icon:       string
    owner_id:   string
    created_at: string
    updated_at: string
}

export interface WS_Message {
    event:  string
    data:   any
}

export interface Msg_request {
    content: string
    channel: string
}

export interface UserOBJ {
    uuid:       string
    username:   string
    avatar:     string
    created_at: number
}

export interface MemberOBJ {
	uuid:       string
	avatar:     string
	username:   string
	is_owner:   boolean
	status:     number
	channel_id:  string
	joined_at:   string
	created_at:  string
}

export interface FriendOBJ extends UserOBJ {
    status: number
    incoming: boolean
    pending: boolean
}