import { useContext, useRef } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { CreateChannel as APICreateChannel } from "../api/channel";

export default function CreateChannel() {
    const user:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);

    const channel_name = useRef<HTMLInputElement>(undefined!);
    const channel_icon = useRef<HTMLInputElement>(undefined!);
    function HandleCreateChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const channelName = channel_name.current.value;
        const channelIcon = channel_icon.current.value;
        if (channelName !== "") {
            APICreateChannel(user.accessToken, channelName, channelIcon)
        }
        state_context.setCreateChannel(false);
    }
    return (
        <div onClick={() => state_context.setCreateChannel(false)} className="channel-container">
            <div onClick={(e) => e.stopPropagation()} className='create-channel'>
                <button className="create-channel-close-button" onClick={(e) => {e.preventDefault(); state_context.setCreateChannel(false) }}>X</button>
                <div className="create-channel-input-container">
                    <input className="create-channel-input" ref={channel_name} type="text" placeholder="Channel Name" defaultValue={`${user.username}'s channel`}/>
                    <input className="create-channel-input" ref={channel_icon} type="text" placeholder="Url For Channel Icon"/>
                </div>
                <button className="create-channel-create-button" onClick={HandleCreateChannel}>Create</button>
            </div>
        </div>
    )
}
