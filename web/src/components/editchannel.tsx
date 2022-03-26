import { useContext, useRef } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function EditChannel() {
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);

    const channel_name = useRef<HTMLInputElement>(undefined!);
    const channel_icon = useRef<HTMLInputElement>(undefined!);
    function HandleCreateChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const channel_name_value = channel_name.current.value;
        const channel_icon_value = channel_icon.current.value;
        if (channel_name_value !== "") {
            channel_context.gateway.send(
                JSON.stringify({
                    event: "CHANNEL_MODIFY",
                    data: {
                        uuid: state_context.ChannelOBJ.uuid,
                        name: channel_name_value,
                        icon: channel_icon_value
                    }
                })
            );
        }
        state_context.setEditChannel(false);
    }
    return (
        <div className="channel-container">
            <div className='create-channel'>
                <button className="create-channel-close-button" onClick={(e) => {e.preventDefault(); state_context.setEditChannel(false) }}>X</button>
                <div className="create-channel-input-container">
                    <input className="create-channel-input" ref={channel_name} type="text" placeholder="Channel Name" defaultValue={state_context.ChannelOBJ.name}/>
                    <input className="create-channel-input" ref={channel_icon} type="text" placeholder="Url For Channel Icon" defaultValue={state_context.ChannelOBJ.icon}/>
                </div>
                <button className="create-channel-create-button" onClick={HandleCreateChannel}>Save</button>
            </div>
        </div>
    )
}
