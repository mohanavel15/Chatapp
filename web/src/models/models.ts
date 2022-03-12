
export interface MessageOBJ {
    uuid: string
    content: string
    author: UserOBJ
    channel: ChannelOBJ
}

export interface ChannelOBJ {
    uuid: string
    name: string
    icon: string
}

export interface UserOBJ {
    uuid: string
    username: string
    avatar: string
}