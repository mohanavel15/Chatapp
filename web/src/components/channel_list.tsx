import { Link } from "react-router-dom";
import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';

interface ChannelHeaderProps {
    id: string;
    icon: string;
    name: string;
    dm: boolean;
}

export default function ChannelList(props: ChannelHeaderProps) {
    return (
        <Link to={`/channels/${props.id}`} className="linktag" >
            <div className='channel_list'>
                <div className='channel_name'>
                    { props.dm === true && <img className='channel_avatar' src={props.icon} alt="Avatar"  onError={setDefaultAvatar}/> }
                    { props.dm === false && <img className='channel_avatar' src={props.icon} alt="Avatar" onError={setDefaultIcon}/> }
                    <p>{props.name}</p>
                </div>
            </div>
        </Link>
    )
}
