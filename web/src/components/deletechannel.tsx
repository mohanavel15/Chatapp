import { useContext } from "react";
import { ChannelsContext, ChannelContext } from "../contexts/channelctx";
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { DeleteChannel as APIDeleteChannel } from "../api/channel";

export default function DeleteChannel() {
    const state_context: StateContext = useContext(StatesContext);
	const user_ctx:UserContextOBJ = useContext(UserContext);
    const channel_ctx : ChannelContext = useContext(ChannelsContext)

    function HandleDeleteChannel(e: React.MouseEvent<Element, MouseEvent>) {
        const channel_id = state_context.ChannelOBJ.id;
        e.preventDefault();
        APIDeleteChannel(channel_id).then(response => {
            if (response.status === 200) {
                channel_ctx.deleteChannel(channel_id)
            }
        })
        state_context.setDeleteChannel(false);
    }

    return (
        <div onClick={() => {state_context.setDeleteChannel(false) }} className="channel-container">
            <div onClick={(e) => {e.stopPropagation()}} className='delete-channel'>
                <h3>Leave '{state_context.ChannelOBJ.name}'?</h3>
                <p>Are you sure you want to leave? You won't be able to re-join unless you are re-invited</p>
                <button className="popupbox-btn" onClick={(e) => {e.preventDefault(); state_context.setDeleteChannel(false) }}>Cancel</button>
                <button className="popupbox-btn-red popupbox-btn" onClick={HandleDeleteChannel}>Leave</button>
            </div>
        </div>
    )
}