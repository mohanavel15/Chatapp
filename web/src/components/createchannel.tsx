import { useContext, useRef } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { CreateChannel as APICreateChannel } from "../api/channel";
import { ChannelContext, ChannelsContext } from "../contexts/channelctx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function CreateChannel() {
    const user:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);

    const channel_name = useRef<HTMLInputElement>(undefined!);
    const icon_input = useRef<HTMLInputElement>(undefined!);
    const icon_image = useRef<HTMLImageElement>(undefined!);

    function HandleCreateChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const channelName = channel_name.current.value;
        if (channelName === "") return
        
        if (icon_input.current.files && icon_input.current.files.length > 0) {
            let reader = new FileReader();
            reader.readAsDataURL(icon_input.current.files[0]);
            reader.onload = () => {
                APICreateChannel(user.accessToken, channelName, reader.result).then(new_channel => {
                    channel_context.setChannel(p => new Map(p.set(new_channel.id, new_channel)))
                })
            }
        } else {
            APICreateChannel(user.accessToken, channelName, "").then(new_channel => {
                channel_context.setChannel(p => new Map(p.set(new_channel.id, new_channel)))
            })
        }

        state_context.setCreateChannel(false);
    }

    function onIconChange() {
        if (icon_input.current.files && icon_input.current.files.length > 0) {
            const file = icon_input.current.files[0];
            if (file.size > 2097152) {
                alert("image is bigger than 2MB")
                icon_input.current.value=''
                return
            }
            icon_image.current.src = URL.createObjectURL(file);
        }
    }

    return (
        <div onClick={() => state_context.setCreateChannel(false)} className="channel-container">
            <div onClick={(e) => e.stopPropagation()} className='create-channel'>
                <button className="create-channel-close-button" onClick={(e) => {e.preventDefault(); state_context.setCreateChannel(false) }}>X</button>
                <div className="create-channel-input-container">
                    <input className="create-channel-input" ref={channel_name} type="text" placeholder="Channel Name" defaultValue={`${user.username}'s channel`}/>
                    <div className="channel-edit-icon-container">
                        <img className="channel-edit-icon" ref={icon_image} alt="icon" src={""} />
                        <FontAwesomeIcon icon={faCamera} className="channel-edit-icon-camera" onClick={() => icon_input.current.click()} />
				        <input type="file" ref={icon_input} name="filename" hidden onChange={onIconChange} accept="image/*"></input>
                    </div>
                </div>
                <button className="create-channel-create-button" onClick={HandleCreateChannel}>Create</button>
            </div>
        </div>
    )
}
