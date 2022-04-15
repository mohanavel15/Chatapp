import React, { useContext } from 'react'
import axios from 'axios';
import { FriendOBJ, DMChannelOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { setDefaultAvatar } from '../utils/errorhandle';
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faDotCircle, faCircleMinus, IconDefinition, faCheck, faX, faMessage } from '@fortawesome/free-solid-svg-icons';

function Friend({ friend_obj }: { friend_obj: FriendOBJ }) {
	const user_ctx:UserContextOBJ = useContext(UserContext);
    const channel_ctx: ChannelContext = useContext(ChannelsContext);
    const navigate = useNavigate();

    let style: React.CSSProperties
    let icon: IconDefinition
    if (friend_obj.status === 1) {
        style = {
            color: "lime"
        }
        icon = faCircle
    } else if (friend_obj.status === 2) {
        style = {
            color: "red"
        }
        icon = faCircleMinus
    } else {
        style = {
            color: "grey"
        }
        icon = faDotCircle
    }

    function Accept() {
        const updateFriend = (prevFriends: Map<String, FriendOBJ>) => {
            const friend = prevFriends.get(friend_obj.uuid);
            if (friend) {
                friend.pending = false;
                friend.incoming = false;
                prevFriends.set(friend_obj.uuid, friend);
            }
            return prevFriends;
        }

        axios.post("http://127.0.0.1:5000/users/@me/friends", { "to": friend_obj.uuid },{ 
            headers: {
                Authorization: user_ctx.accessToken
            }
        }).then(response => {
            if (response.status === 200) {
                user_ctx.setFriends(prevFriends => new Map(updateFriend(prevFriends)));
            }
        })
    }

    function Decline() {
        const deleteFriend = (prevFriends: Map<String, FriendOBJ>) => {
            prevFriends.delete(friend_obj.uuid);
            return prevFriends;
        }
        axios.delete(`http://127.0.0.1:5000/users/@me/friends/${friend_obj.uuid}`, {
            headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
        }).then(response => {
            if (response.status === 200) {
                user_ctx.setFriends(prevFriends => new Map(deleteFriend(prevFriends)));
            }
        })
    }

    function Message() {
        axios.get<DMChannelOBJ>(`http://127.0.0.1:5000/dms/${friend_obj.uuid}`, {
            headers: {
                Authorization: localStorage.getItem("access_token") || ""
            }
        }).then(response => {
            if (response.status === 200) {
                const dm_channel_id = response.data.uuid;
                if (!channel_ctx.DMChannels.has(dm_channel_id)) {
                    channel_ctx.setDMChannels(prevChannels => new Map(prevChannels.set(dm_channel_id, response.data)));
                }
                navigate(`/channels/${dm_channel_id}`);
            }
        })
    }

    return (
        <div className='Friend'>
            <div className='Friend-User'>
                <div className='Friend-Avatar-Container'>
                <img className='Friend-Avatar' src={friend_obj.avatar} alt={"Avatar"} onError={setDefaultAvatar} />
                <FontAwesomeIcon className='Friend-Status' icon={icon} style={style} />
                </div>
                <h3 className='Friend-Name'>{friend_obj.username}</h3>
            </div>
            <div className='Friend-Actions-Container'>
            { friend_obj.pending === true && friend_obj.incoming === true && <button className='Friend-Actions Friend-Actions-Accept' onClick={Accept}><FontAwesomeIcon icon={faCheck} /></button> }
            { friend_obj.pending === true && <button className='Friend-Actions Friend-Actions-Decline' onClick={Decline}><FontAwesomeIcon icon={faX} /></button> }
            { friend_obj.pending === false && friend_obj.incoming === false && <button className='Friend-Actions Friend-Actions-Accept' onClick={Message}><FontAwesomeIcon icon={faMessage} /></button> }
            </div>
        </div>
    )
}

export default Friend;