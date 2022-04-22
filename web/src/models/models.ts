
export interface MessageOBJ {
    uuid:           string
    content:        string
    author:         UserOBJ
    channel_id:     string
    created_at:     number
    updated_at:     number
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

export interface DMChannelOBJ {
    uuid: string
    recipient: UserOBJ
}

export interface ReadyOBJ {
    user: UserOBJ
    dm_channels: DMChannelOBJ[]
    channels: ChannelOBJ[]
    friends: FriendOBJ[]
}