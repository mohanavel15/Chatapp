import { useContext, useRef } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';

export default function CreateChannel() {
    const username = localStorage.getItem('profile-username')?.toString();
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
                    event: "CHANNEL_CREATE",
                    data: {
                        name: channel_name_value,
                        icon: channel_icon_value
                    }
                })
            );
        }
        state_context.setCreateChannel(false);
    }
    return (
        <div className="channel-container">
            <div className='create-channel'>
                <button className="create-channel-close-button" onClick={(e) => {e.preventDefault(); state_context.setCreateChannel(false) }}>X</button>
                <div className="create-channel-input-container">
                    <input className="create-channel-input" ref={channel_name} type="text" placeholder="Channel Name" defaultValue={`${username}'s channel`}/>
                    <input className="create-channel-input" ref={channel_icon} type="text" placeholder="Url For Channel Icon"/>
                </div>
                <button className="create-channel-create-button" onClick={HandleCreateChannel}>Create</button>
            </div>
        </div>
    )
}
