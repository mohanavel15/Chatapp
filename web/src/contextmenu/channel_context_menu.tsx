import React, { useContext, useEffect, useState } from 'react'
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { BlockUser, UnBlock, AddFriend } from '../utils/api';
import { ChannelOBJ, FriendOBJ } from '../models/models';
import Routes from '../config';

interface propsChannelCtxProps {
    location: {x: number, y: number, channel: ChannelOBJ},
}

export default function ChannelContextMenu(props: propsChannelCtxProps) {
  	const state_context: StateContext = useContext(StatesContext);
  	const user_ctx:UserContextOBJ = useContext(UserContext);
    
  	let style: React.CSSProperties
  	style = {
        top: props.location.y,
        left: props.location.x
  	}

    const [isFriend, setIsFriend] = useState(0);

    const deleteFriend = () => {
        const delete_Friend = (prevFriends: Map<String, FriendOBJ>) => {
            prevFriends.delete(props.location.channel.recipient.uuid);
            return prevFriends;
        }
        const url = Routes.Friends + "/" + props.location.channel.recipient.uuid;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": user_ctx.accessToken,
            }
        }).then(response => {
            if (response.status === 200) {
                user_ctx.setFriends(prevFriends => new Map(delete_Friend(prevFriends)));
            }
        })
    }
    
    useEffect(() => {
        if (props.location.channel.type === 0) {
            const is_friend = user_ctx.friends.get(props.location.channel.recipient.uuid)
            if (is_friend === undefined) {
                setIsFriend(0)
            } else {
                if (is_friend.pending === true) {
                    setIsFriend(1)
                } else {
                    setIsFriend(2)
                }
            }
        }
    }, [props.location.channel, user_ctx.friends])

  	return (
    	<div className='ContextMenu' style={style}>
            { props.location.channel.type === 1 && props.location.channel.owner_id === user_ctx.uuid && <button className='CtxBtn' onClick={() =>{state_context.setChannelOBJ(props.location.channel);state_context.setEditChannel(true);}}>Edit Channel</button> }
            { props.location.channel.type === 1 && <button className='CtxDelBtn' onClick={() => {state_context.setChannelOBJ(props.location.channel);state_context.setDeleteChannel(true);}}>Leave Channel</button> }
            { props.location.channel.type === 0 && isFriend === 0 && <button className='CtxBtn' onClick={() => AddFriend(user_ctx.accessToken, props.location.channel.recipient.uuid)}>Add Friend</button> }
            { props.location.channel.type === 0 && isFriend === 1 && <button className='CtxDelBtn' onClick={deleteFriend}>Cancel Request</button> }
            { props.location.channel.type === 0 && isFriend === 2 && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button> }
            { props.location.channel.type === 0 && !user_ctx.blocked.has(props.location.channel.recipient.uuid) && <button className='CtxDelBtn' onClick={() => BlockUser(user_ctx.accessToken, props.location.channel.recipient.uuid)}>Block User</button> }
            { props.location.channel.type === 0 && user_ctx.blocked.has(props.location.channel.recipient.uuid) && <button className='CtxBtn' onClick={() => UnBlock(user_ctx.accessToken, props.location.channel.recipient.uuid)}>Unblock User</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.channel.uuid)}}>Copy ID</button>
        </div>
  )
}
