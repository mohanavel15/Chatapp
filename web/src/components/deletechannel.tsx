import { useContext } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import Routes from "../config";

export default function DeleteChannel() {
    const state_context: StateContext = useContext(StatesContext);
	const user_ctx:UserContextOBJ = useContext(UserContext);

    function HandleDeleteChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const url = Routes.Channels+"/"+state_context.ChannelOBJ.uuid;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": user_ctx.accessToken,
            }
        })
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