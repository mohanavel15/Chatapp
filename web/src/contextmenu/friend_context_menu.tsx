import React, { useContext } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import Routes from '../config';
import { useNavigate } from "react-router-dom";
import { FriendOBJ, ChannelOBJ } from '../models/models';
import { DeleteFriend } from '../api/friend';

interface propsChannelCtxProps {
    x: number, y: number, friend_obj: FriendOBJ
}

export default function FriendContextMenu(props: propsChannelCtxProps) {
    const user_ctx: UserContextOBJ = useContext(UserContext);
    const navigate = useNavigate();
    const channel_ctx: ChannelContext = useContext(ChannelsContext);

    let style: React.CSSProperties
    style = {
        top: props.y,
        left: props.x
    }

    const deleteFriend = () => {
        DeleteFriend(user_ctx.accessToken, props.friend_obj.uuid).then(response => {
            if (response.status === 200) {
                user_ctx.deleteFriend(props.friend_obj.uuid)
            }
        })
    }

    function Message() {
        const url = Routes.host + "/dms/" + props.friend_obj.uuid;
        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": user_ctx.accessToken,
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(dm_channel => {
                    if (!channel_ctx.channels.has(dm_channel.uuid)) {
                        let channel: ChannelOBJ = dm_channel;
                        channel.type = 0; 
                        channel_ctx.setChannel(prevChannels => new Map(prevChannels.set(channel.uuid, channel)));
                    }
                    navigate(`/channels/${dm_channel.uuid}`);
                })
            }
        })
    }

    return (
        <div className='ContextMenu' style={style}>
            {props.friend_obj.pending === false && <button className='CtxBtn' onClick={Message}>Message</button>}
            {props.friend_obj.pending === false && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button>}
            {props.friend_obj.pending === true && <button className='CtxDelBtn' onClick={deleteFriend}>Decline</button>}
            <button className='CtxBtn' onClick={() => { navigator.clipboard.writeText(props.friend_obj.uuid) }}>Copy ID</button>
        </div>
    )
}