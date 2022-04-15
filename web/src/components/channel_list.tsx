import { Link } from "react-router-dom";
import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faDotCircle, faCircleMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface ChannelHeaderProps {
    id: string;
    icon: string;
    name: string;
    status: number;
    dm: boolean;
}

export default function ChannelList(props: ChannelHeaderProps) {

    let style: React.CSSProperties
    let icon: IconDefinition
    if (props.status === 1) {
        style = {
            color: "lime"
        }
        icon = faCircle
    } else if (props.status === 2) {
        style = {
            color: "red"
        }
        icon = faCircleMinus
    } else {
        style = {
            color: "grey"
        }
        icon = faDotCircle
    }
    
    return (
        <Link to={`/channels/${props.id}`} className="linktag" >
            <div className='channel_list'>
                <div className='channel_name'>
                    { props.dm === true && 
                        <div className="dm_avatar">
                            <img src={props.icon} onError={setDefaultAvatar} alt={"Icon"} />
                            <FontAwesomeIcon className='dm_status_icon' style={style} icon={icon} />
                        </div>
                    }
                    { props.dm === false && <img className='channel_avatar' src={props.icon} alt="Avatar" onError={setDefaultIcon}/> }
                    <p>{props.name}</p>
                </div>
            </div>
        </Link>
    )
}
