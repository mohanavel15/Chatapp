
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
    created_at: string
    updated_at: string
}

export interface UserOBJ {
    uuid:       string
    username:   string
    avatar:     string
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