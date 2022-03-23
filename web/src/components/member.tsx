import React from 'react'
import { MemberOBJ } from '../models/models';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from '@fortawesome/free-solid-svg-icons'

function Member({ member_obj }: {member_obj: MemberOBJ}) {
    function setDefaultAvatar(event : React.SyntheticEvent<HTMLImageElement, Event>) {
        event.currentTarget.src = "/assets/default_avatar.jpeg";
    }

    if (!member_obj.avatar) {
        member_obj.avatar = "/assets/default_avatar.jpeg";
    }
    let style: React.CSSProperties

    if (member_obj.status === 1) {
        style = {
            border: "2px solid green",
            padding: "3px"
        }
    } else {
        style = {
            border: "2px solid red",
            padding: "3px"
        }
    }

    console.log("username:", member_obj.username, "owner:", member_obj.is_owner);

    return (
        <div className='member'>
            <img src={member_obj.avatar} style={style} />
            <p>{member_obj.username}</p>
            {member_obj.is_owner && <div className='owner-icon'><FontAwesomeIcon icon={faCrown} /></div>}
        </div>
    )
}

export default Member;