import { Link, useParams } from "react-router-dom";
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
    const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

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
    
    const active_channel_style: React.CSSProperties = {}

    if (channel_id === props.id) {
        active_channel_style.backgroundColor = "#393d42"
        active_channel_style.borderRadius = "5px"
    }
    
    return (
        <Link to={`/channels/${props.id}`} className="linktag" >
            <div className='channel_list' style={active_channel_style}>
                <div className='channel_name'>
                    { props.dm === true && 
                        <div className="dm_avatar">
                            <img src={props.icon} onError={setDefaultAvatar} alt={"Avatar"} />
                            <FontAwesomeIcon className='dm_status_icon' style={style} icon={icon} />
                        </div>
                    }
                    { props.dm === false && <img className='channel_avatar' src={props.icon} alt={"Icon"} onError={setDefaultIcon}/> }
                    <p>{props.name}</p>
                </div>
            </div>
        </Link>
    )
}
