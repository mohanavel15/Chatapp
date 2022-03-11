import React from 'react'
import { Link } from "react-router-dom";

interface ChannelHeaderProps {
    id: string;
    icon: string;
    name: string;
}

export default function ChannelList(props: ChannelHeaderProps) {
    return (
        <Link to={`/channels/${props.id}`} >
            <div className='channel_list'>
                <div className='channel_name'>
                    <img className='channel_avatar' src={props.icon} alt="Avatar" />
                    <p>{props.name}</p>
                </div>
            </div>
        </Link>
    )
}
