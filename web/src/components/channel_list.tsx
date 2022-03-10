import React from 'react'
import { Link } from "react-router-dom";

interface ChannelHeaderProps {
    id: string;
}

export default function ChannelList(props: ChannelHeaderProps) {
    return (
        <Link to={`/channels/${props.id}`} >
            <div className='channel_list'>
                <div className='channel_name'>
                    <img className='channel_avatar' src="/assets/default_avatar.jpeg" alt="Avatar" />
                    <p>{props.id}</p>
                </div>
            </div>
        </Link>
    )
}
