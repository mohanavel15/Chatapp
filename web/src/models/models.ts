
export interface MessageOBJ {
    uuid: string
    content: string
    author: {
        uuid: string
        avatar: string
        username: string
    };
    channel: Channel
}

export interface Channel {
    uuid: string
    name: string
    icon: string
}

export interface User {
    uuid: string
    username: string
    avatar: string
}