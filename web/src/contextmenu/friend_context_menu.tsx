import React, { useContext } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { FriendOBJ } from '../models/models';
import Routes from '../config';

interface propsChannelCtxProps {
    value: { x: number, y: number, friend_obj: FriendOBJ }
}

export default function FriendContextMenu(props: propsChannelCtxProps) {
    const user_ctx: UserContextOBJ = useContext(UserContext);

    let style: React.CSSProperties
    style = {
        top: props.value.y,
        left: props.value.x
    }

    const deleteFriend = () => {
        const delete_Friend = (prevFriends: Map<String, FriendOBJ>) => {
            prevFriends.delete(props.value.friend_obj.uuid);
            return prevFriends;
        }
        const url = Routes.Friends + "/" + props.value.friend_obj.uuid;
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
    return (
        <div className='ContextMenu' style={style}>
            {props.value.friend_obj.pending === false && <button className='CtxBtn' onClick={() => { }}>Message</button>}
            {props.value.friend_obj.pending === false && <button className='CtxBtn' onClick={() => { }}>Voice Call</button>}
            {props.value.friend_obj.pending === false && <button className='CtxBtn' onClick={() => { }}>Video Call</button>}
            {props.value.friend_obj.pending === false && <button className='CtxDelBtn' onClick={deleteFriend}>Remove Friend</button>}
            {props.value.friend_obj.pending === true && <button className='CtxDelBtn' onClick={deleteFriend}>Decline</button>}
            <button className='CtxBtn' onClick={() => { navigator.clipboard.writeText(props.value.friend_obj.uuid) }}>Copy ID</button>
        </div>
    )
}