import React, { useContext, useEffect, useState } from 'react'
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ChannelOBJ } from '../models/models';

import { AddFriend, DeleteFriend } from '../api/friend';
import { BlockUser, UnBlock } from '../api/block';

interface propsChannelCtxProps {
    x: number, y: number, channel: ChannelOBJ
}

export default function ChannelContextMenu(props: propsChannelCtxProps) {
  	const state_context: StateContext = useContext(StatesContext);
  	const user_ctx:UserContextOBJ = useContext(UserContext);
    
  	let style: React.CSSProperties
  	style = {
        top: props.y,
        left: props.x
  	}

    const [isFriend, setIsFriend] = useState(0);

    const deleteFriend = () => {
        DeleteFriend(user_ctx.accessToken, props.channel.recipient.uuid).then(response => {
            if (response.status === 200) {
                user_ctx.deleteFriend(props.channel.recipient.uuid)
            }
        })
    }
    
    useEffect(() => {
        if (props.channel.type === 0) {
            const is_friend = user_ctx.friends.get(props.channel.recipient.uuid)
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
    }, [props.channel, user_ctx.friends])

  	return (
    	<div className='ContextMenu' style={style}>
            { props.channel.type === 1 && props.channel.owner_id === user_ctx.uuid && <button className='CtxBtn' onClick={() =>{state_context.setChannelOBJ(props.channel);state_context.setEditChannel(true);}}>Edit Channel</button> }
            { props.channel.type === 1 && <button className='CtxDelBtn' onClick={() => {state_context.setChannelOBJ(props.channel);state_context.setDeleteChannel(true);}}>Leave Channel</button> }
            { props.channel.type === 0 && isFriend === 0 && <button className='CtxBtn' onClick={() => AddFriend(user_ctx.accessToken, props.channel.recipient.uuid)}>Add Friend</button> }
            { props.channel.type === 0 && isFriend === 1 && <button className='CtxDelBtn' onClick={deleteFriend}>Cancel Request</button> }
            { props.channel.type === 0 && isFriend === 2 && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button> }
            { props.channel.type === 0 && !user_ctx.blocked.has(props.channel.recipient.uuid) && <button className='CtxDelBtn' onClick={() => BlockUser(user_ctx.accessToken, props.channel.recipient.uuid)}>Block User</button> }
            { props.channel.type === 0 && user_ctx.blocked.has(props.channel.recipient.uuid) && <button className='CtxBtn' onClick={() => UnBlock(user_ctx.accessToken, props.channel.recipient.uuid)}>Unblock User</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.channel.uuid)}}>Copy ID</button>
        </div>
  )
}
