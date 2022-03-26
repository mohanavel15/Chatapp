import { useContext, useRef } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function DeleteChannel() {
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);

    function HandleDeleteChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        channel_context.gateway.send(
            JSON.stringify({
                event: "CHANNEL_DELETE",
                data: {
                    uuid: state_context.ChannelOBJ.uuid,
                }
            })
        );
        state_context.setDeleteChannel(false);
    }
       

    return (
        <div className="channel-container">
            <div className='delete-channel'>
                <h3>Leave '{state_context.ChannelOBJ.name}'?</h3>
                <p>Are you sure you want to leave? You won't be able to re-join unless you are re-invited</p>
                <button className="popupbox-btn" onClick={(e) => {e.preventDefault(); state_context.setDeleteChannel(false) }}>Cancel</button>
                <button className="popupbox-btn-red popupbox-btn" onClick={HandleDeleteChannel}>Leave</button>
            </div>
        </div>
    )
}