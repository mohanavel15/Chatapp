
export interface MessageOBJ {
    id:           string
    content:        string
    author:         UserOBJ
    channel_id:     string
    created_at:     number
    updated_at:     number
    attachments:    Attachment[]
}

export interface Attachment {
	id:           string
	name:           string
	size:           number
	content_type:   string
	url:            string
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
    id:       string
    username:   string
    avatar:     string
    status: number
    created_at: number
}

export interface InviteOBJ {
    invite_code: string
	created_at: string
}

export interface BanOBJ {
    id: string
    banned_by: UserOBJ
    banned_user: UserOBJ
    channel: ChannelOBJ
    reason: string
    created_at: number
}

export interface ChannelOBJ {
    id: string
    name: string
    icon: string
    type: number
    owner_id: string
    created_at: string
    recipients: UserOBJ[]
}
export interface ReadyOBJ {
    user: UserOBJ
    channels: ChannelOBJ[]
}

export interface Status {
    user_id: string
    status: number
    type: number
    channel_id: string
}
