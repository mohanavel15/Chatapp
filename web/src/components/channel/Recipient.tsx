import React from 'react'
import { UserOBJ } from '../../models/models';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faDotCircle, faCircleMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { setDefaultAvatar } from '../../utils/errorhandle';
import { FaCrown } from "react-icons/fa";

export default function Recipient({ user, isOwner }: {user: UserOBJ, isOwner: boolean }) {
    let style: React.CSSProperties
    let icon: IconDefinition
    if (user.status === 1) {
        style = {
            color: "lime"
        }
        icon = faCircle
    } else if (user.status === 2) {
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
        <div className='h-12 flex items-center rounded hover:bg-zinc-900 cursor-pointer'>
            <div className='avatar-container'>
            <img src={user.avatar} onError={setDefaultAvatar} alt={"Icon"} />
            <FontAwesomeIcon className='status_icon' style={style} icon={icon} />
            </div>
            <p>{user.username}</p>
            { isOwner && <div className='owner-icon'><FaCrown /></div> }
        </div>
    )
}