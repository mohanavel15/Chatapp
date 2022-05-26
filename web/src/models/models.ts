
export interface MessageOBJ {
    uuid:           string
    content:        string
    author:         UserOBJ
    channel_id:     string
    created_at:     number
    updated_at:     number
    attachments:    Attachment[]
}

export interface Attachment {
	uuid:           string
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
    uuid:       string
    username:   string
    avatar:     string
    status: number
    created_at: number
}

export interface MemberOBJ extends UserOBJ {
	is_owner:   boolean
	channel_id:  string
	joined_at:   string
}

export interface FriendOBJ extends UserOBJ {
    incoming: boolean
    pending: boolean
}

export interface InviteOBJ {
    invite_code: string
	created_at: string
}

export interface BanOBJ {
    uuid: string
    banned_by: UserOBJ
    banned_user: UserOBJ
    channel: ChannelOBJ
    reason: string
    created_at: number
}

export interface ChannelOBJ {
    uuid: string
    name: string
    icon: string
    type: number
    owner_id: string
    created_at: string
    recipient: UserOBJ
}
export interface ReadyOBJ {
    user: UserOBJ
    dm_channels: ChannelOBJ[]
    channels: ChannelOBJ[]
    friends: FriendOBJ[]
}

export interface Status {
    user_id: string
    status: number
    type: number
    channel_id: string
}
