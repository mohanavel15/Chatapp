import { useContext, useEffect, useState } from "react";
import { MdOutlineChatBubbleOutline, MdOutlinePeopleAlt } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { setDefaultAvatar } from '../utils/errorhandle';

export default function NavBar() {
    const [hideNavBar, setHideNavBar] = useState(false)
    const location = useLocation()
    useEffect(() => {
        if (/\/channels\/.+/.test(location.pathname)) {
            setHideNavBar(true)
        } else {
            setHideNavBar(false)
        }
    }, [location])
    
    const navigate = useNavigate()
    const user:UserContextOBJ = useContext(UserContext);
    return (
        <div className={`h-12 w-full md:h-full md:w-12 ${ hideNavBar ? 'hidden' : 'flex' } md:flex md:flex-col items-center border-t md:border-t-0 md:border-r border-zinc-800`}>
            <img src={user.avatar} alt="avatar" className="w-8 h-8 m-2 hover:cursor-pointer" onError={setDefaultAvatar} />
            <MdOutlineChatBubbleOutline size={32} className="m-2 hover:cursor-pointer" onClick={ () => navigate("/channels") } />
            <MdOutlinePeopleAlt size={32} className="m-2 hover:cursor-pointer" onClick={ () => navigate("/relationships") } />
        </div>
    )
}
