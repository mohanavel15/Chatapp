import { useContext } from "react";
import { StatesContext, StateContext } from "../../contexts/states";
import { UserContextOBJ, UserContext } from "../../contexts/usercontext";
import { setDefaultAvatar } from '../../utils/errorhandle';
import { FaCog } from 'react-icons/fa'
import IconButton from "../buttons/IconButton";

export default function ProfileBar() {
    const user:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);

    return (
        <div className="bg-gray-900 h-20 flex items-center">
            <img className="rounded-full h-10 w-10 mx-2" src={user.avatar} alt="avatar" onError={setDefaultAvatar} />
            <span className="font-bold text-lg">{user.username}</span>
            <IconButton onClick={() => { state_context.setSettings(true) }}>
                <FaCog />
            </IconButton>
        </div>
    );
}
