import { Link, useParams } from "react-router-dom";
import { setDefaultIcon, setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faDotCircle, faCircleMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { ChannelOBJ } from "../models/models";

interface ChannelHeaderProps {
    channel: ChannelOBJ
}

export default function ChannelList(props: ChannelHeaderProps) {
    const parameter  = useParams<string>();
	let channel_id = parameter.id || "@me";

    let style: React.CSSProperties
    let icon: IconDefinition
    if (props.channel.recipients[0].status === 1) {
        style = {
            color: "lime"
        }
        icon = faCircle
    } else if (props.channel.recipients[0].status === 2) {
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

    if (channel_id === props.channel.id) {
        active_channel_style.backgroundColor = "#393d42"
        active_channel_style.borderRadius = "5px"
    }
    
    return (
        <Link to={`/channels/${props.channel.id}`} className="linktag" >
            <div className='channel_list' style={active_channel_style}>
                <div className='channel_name'>
                    { props.channel.type === 1 && 
                        <div className="dm_avatar">
                            <img src={props.channel.recipients[0].avatar} onError={setDefaultAvatar} alt={"Avatar"} />
                            <FontAwesomeIcon className='dm_status_icon' style={style} icon={icon} />
                        </div>
                    }
                    { props.channel.type === 2 && <img className='channel_avatar' src={props.channel.icon} alt={"Icon"} onError={setDefaultIcon}/> }
                    <p>{    props.channel.type === 1 ? 
                            props.channel.recipients[0].username : 
                            props.channel.name 
                    }</p>
                </div>
            </div>
        </Link>
    )
}
