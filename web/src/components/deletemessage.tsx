import React, { useContext } from 'react'
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import Routes from '../config';

export default function DeleteMessage() {
    const state_context: StateContext = useContext(StatesContext);
	const user_ctx:UserContextOBJ = useContext(UserContext);

    function HandleDeleteMessage(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const url = Routes.Channels+"/"+state_context.ChannelOBJ.uuid;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": user_ctx.accessToken
            }
        })
        state_context.setDeleteMessage(false);
    }
    return (
        <div className="channel-container">
            <div className='delete-channel'>
                    <h3>Delete Message</h3>
                    <p>Are you sure you want to delete?</p>
                    <button className="popupbox-btn" onClick={(e) => {e.preventDefault(); state_context.setDeleteMessage(false) }}>Cancel</button>
                    <button className="popupbox-btn-red popupbox-btn" onClick={HandleDeleteMessage}>Delete</button>
                </div>
        </div>
    )
}
