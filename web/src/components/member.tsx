import React from 'react'
import { UserOBJ } from '../models/models';

function Member({ member_obj }: {member_obj: UserOBJ}) {
    function setDefaultAvatar(event : React.SyntheticEvent<HTMLImageElement, Event>) {
        event.currentTarget.src = "/assets/default_avatar.jpeg";
    }

    if (!member_obj.avatar) {
        member_obj.avatar = "/assets/default_avatar.jpeg";
    }

    return (
        <div className='member'>
            <img src={member_obj.avatar} />
            <p>{member_obj.username}</p>
        </div>
    )
}

export default Member;