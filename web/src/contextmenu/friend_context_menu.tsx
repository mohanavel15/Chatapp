import React, { useContext } from 'react'
import axios from 'axios'
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

import { FriendOBJ } from '../models/models';

interface propsChannelCtxProps {
    value: {x: number, y: number, friend_obj: FriendOBJ}
}

export default function FriendContextMenu(props: propsChannelCtxProps) {
  const state_context: StateContext = useContext(StatesContext);
  const user_ctx:UserContextOBJ = useContext(UserContext);

  let style: React.CSSProperties
  style = {
        top: props.value.y,
        left: props.value.x
  }

    const deleteFriend = () => {
        axios.delete(`http://127.0.0.1:5000/users/@me/friends/${props.value.friend_obj.uuid}`, {
            headers: {
                Authorization: user_ctx.accessToken,
            }
        })
    }
    return (
        <div className='ContextMenu' style={style}>
            {props.value.friend_obj.pending === false && <button className='CtxBtn' onClick={() => {}}>Message</button> }
            {props.value.friend_obj.pending === false && <button className='CtxBtn' onClick={() => {}}>Voice Call</button> }
            {props.value.friend_obj.pending === false && <button className='CtxBtn' onClick={() => {}}>Video Call</button> }
            {props.value.friend_obj.pending === false && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button> }
            {props.value.friend_obj.pending === true && <button className='CtxDelBtn' onClick={deleteFriend}>Decline</button> }
            <button className='CtxBtn' onClick={() => {navigator.clipboard.writeText(props.value.friend_obj.uuid)}}>Copy ID</button>
        </div>
    )
}