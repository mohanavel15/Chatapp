
export type MessageOBJ = {
    id: string
    content: string
    author: UserOBJ
    channel_id: string
    created_at: number
    updated_at: number
    attachments: Attachment[]
    system_message: boolean
}

export type Attachment = {
    id: string
    filename: string
    size: number
    content_type: string
    url: string
}

export type WS_Message = {
    event: string
    data: any
}

export type Msg_request = {
    content: string
    channel: string
}

export type UserOBJ = {
    id: string
    username: string
    avatar: string
    status: number
    created_at: number
}

export type InviteOBJ = {
    invite_code: string
    created_at: string
}

export type BanOBJ = {
    id: string
    banned_by: UserOBJ
    banned_user: UserOBJ
    channel: ChannelOBJ
    reason: string
    created_at: number
}

export type ChannelOBJ = {
    id: string
    name: string
    icon: string
    type: number
    owner_id: string
    created_at: string
    recipients: UserOBJ[]
}
export type ReadyOBJ = {
    user: UserOBJ
    channels: ChannelOBJ[]
}

export type Status = {
    user_id: string
    status: number
    type: number
    channel_id: string
}
