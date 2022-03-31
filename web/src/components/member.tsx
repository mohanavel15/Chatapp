import React from 'react'
import { MemberOBJ } from '../models/models';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faCircle, faDotCircle, faCircleMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons'

function Member({ member_obj }: {member_obj: MemberOBJ}) {
    function setDefaultAvatar(event : React.SyntheticEvent<HTMLImageElement, Event>) {
        event.currentTarget.src = "/assets/default_avatar.jpeg";
    }

    if (!member_obj.avatar) {
        member_obj.avatar = "/assets/default_avatar.jpeg";
    }

    let style: React.CSSProperties
    let icon: IconDefinition
    if (member_obj.status === 1) {
        style = {
            color: "lime"
        }
        icon = faCircle
    } else if (member_obj.status === 2) {
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
        <div className='member'>
            <div className='avatar-container'>
            <img src={member_obj.avatar} onError={setDefaultAvatar} alt={"Icon"} />
            <FontAwesomeIcon className='status_icon' style={style} icon={icon} />
            </div>
            <p>{member_obj.username}</p>
            {member_obj.is_owner && <div className='owner-icon'><FontAwesomeIcon icon={faCrown} /></div>}
        </div>
    )
}

export default Member;