import React, { useContext } from 'react'
import axios from 'axios';
import { FriendOBJ } from '../models/models';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from '@fortawesome/free-solid-svg-icons'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

function Friend({ friend_obj }: { friend_obj: FriendOBJ }) {
	const user_ctx:UserContextOBJ = useContext(UserContext);

    function setDefaultAvatar(event : React.SyntheticEvent<HTMLImageElement, Event>) {
        event.currentTarget.src = "/assets/default_avatar.jpeg";
    }

    function Accept() {
        const updateFriend = (prevFriends: Map<String, FriendOBJ>) => {
            const friend = prevFriends.get(friend_obj.user.uuid);
            if (friend) {
                friend.pending = false;
                friend.incoming = false;
                prevFriends.set(friend_obj.user.uuid, friend);
            }
            return prevFriends;
        }

        axios.post("http://127.0.0.1:5000/users/@me/friends", { "to": friend_obj.user.uuid },{ 
            headers: {
                Authorization: user_ctx.accessToken
            }
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                user_ctx.setFriends(prevFriends => new Map(updateFriend(prevFriends)));
            }
        })
    }

    function Decline() {
        const deleteFriend = (prevFriends: Map<String, FriendOBJ>) => {
            prevFriends.delete(friend_obj.user.uuid);
            return prevFriends;
        }
        axios.delete(`http://127.0.0.1:5000/users/@me/friends/${friend_obj.user.uuid}`, {
            headers: {
				Authorization: localStorage.getItem("access_token") || ""
			}
        }).then(response => {
            if (response.status === 200) {
                user_ctx.setFriends(prevFriends => new Map(deleteFriend(prevFriends)));
            }
        })
    }

    return (
        <div className='Friend'>
            <div className='Friend-User'>
                <img className='Friend-Avatar' src={friend_obj.user.avatar} alt={"Avatar"} onError={setDefaultAvatar} />
                <h3 className='Friend-Name'>{friend_obj.user.username}</h3>
            </div>
            <div className='Friend-Actions-Container'>
            { friend_obj.pending === true && friend_obj.incoming === true && <button className='Friend-Actions Friend-Actions-Accept' onClick={Accept}><FontAwesomeIcon icon={faCheck} /></button> }
            { friend_obj.pending === true && <button className='Friend-Actions Friend-Actions-Decline' onClick={Decline}><FontAwesomeIcon icon={faX} /></button> }
            </div>
        </div>
    )
}

export default Friend;