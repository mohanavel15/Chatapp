import React, { useContext } from 'react'
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function DeleteMessage() {
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);

    function HandleDeleteMessage(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        channel_context.gateway.send(
            JSON.stringify({
                event: "MESSAGE_DELETE",
                data: {
                    uuid: state_context.messageOBJ.uuid,
                }
            })
        );
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
