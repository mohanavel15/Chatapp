import React, { useContext, useEffect, useState } from 'react'
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

import { ChannelOBJ, FriendOBJ } from '../models/models';
import Routes from '../config';

interface propsChannelCtxProps {
    location: {x: number, y: number, channel: ChannelOBJ},
}

export default function ChannelContextMenu(props: propsChannelCtxProps) {
  	const state_context: StateContext = useContext(StatesContext);
  	const user_ctx:UserContextOBJ = useContext(UserContext);
    
    const [isFriend, setIsFriend] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);

  	let style: React.CSSProperties
  	style = {
        top: props.location.y,
        left: props.location.x
  	}

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

    function AddFriend() {
        fetch(Routes.Friends, {
            method: "POST",
            headers: {
                "Authorization": user_ctx.accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "to": props.location.channel.recipient.uuid
            })
        })
	}

    function BlockUser() {
        fetch(Routes.Blocks, {
            method: "POST",
            headers: {
                "Authorization": user_ctx.accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "uuid": props.location.channel.recipient.uuid
            })
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

    useEffect(() => {
        if (props.location.channel.type === 0) {
            const is_blocked = user_ctx.blocked.has(props.location.channel.recipient.uuid)
            if (is_blocked === true) {
                setIsBlocked(true)
            } else {
                setIsBlocked(false)
            }
        }
    }, [props.location.channel, user_ctx.blocked])

  	return (
    	<div className='ContextMenu' style={style}>
        { props.location.channel.owner_id === user_ctx.uuid && <button className='CtxBtn' onClick={() =>{
            state_context.setChannelOBJ(props.location.channel);
            state_context.setEditChannel(true);
        }}>Edit Channel</button> }

        { props.location.channel.type === 1 && <button className='CtxDelBtn' onClick={() => {
            state_context.setChannelOBJ(props.location.channel);
            state_context.setDeleteChannel(true);
        }
        }>Leave Channel</button> }

        { props.location.channel.type === 0 && isFriend === 0 && <button className='CtxBtn' onClick={AddFriend}>Add Friend</button> }
        { props.location.channel.type === 0 && isFriend === 1 && <button className='CtxDelBtn' onClick={deleteFriend}>Cancel Request</button> }
        { props.location.channel.type === 0 && isFriend === 2 && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button> }

        { props.location.channel.type === 0 && <button className='CtxDelBtn' onClick={BlockUser}>Block User</button> }

        <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.location.channel.uuid)}}>Copy ID</button>
    </div>
  )
}
