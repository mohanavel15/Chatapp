import { useContext } from "react";
import { ChannelsContext } from "../../contexts/channelctx";
import { DeleteChannel as APIDeleteChannel } from "../../api/channel";
import { ChannelOBJ } from "../../models/models";
import { PopUpContext } from "../../contexts/popup";

export default function DeleteChannel({ channel }: { channel: ChannelOBJ }) {
    const channel_ctx = useContext(ChannelsContext);
    const popup_ctx = useContext(PopUpContext);

    function HandleDeleteChannel() {
        APIDeleteChannel(channel.id).then(response => {
            if (response.status === 200) {
                channel_ctx.deleteChannel(channel.id)
            }
        })
        popup_ctx.close()
    }

    return (
        <div onClick={(e) => e.stopPropagation()} className='delete-channel'>
            <h3>Leave '{channel.name}'?</h3>
            <p>Are you sure you want to leave? You won't be able to re-join unless you are re-invited</p>
            <button className="popupbox-btn" onClick={() => popup_ctx.close() }>Cancel</button>
            <button className="popupbox-btn-red popupbox-btn" onClick={HandleDeleteChannel}>Leave</button>
        </div>
    )
}