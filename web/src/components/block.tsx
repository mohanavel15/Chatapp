import { useContext } from 'react'
import { UserOBJ } from '../models/models';
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { setDefaultAvatar } from '../utils/errorhandle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserXmark } from '@fortawesome/free-solid-svg-icons';
import { UnBlock as APIUnblock } from '../api/block';

function Block({ user }: { user: UserOBJ }) {
	const user_ctx:UserContextOBJ = useContext(UserContext);

    function UnBlock() {
        const UnBlockUser = (prevBlocked: Map<String, UserOBJ>) => {
            prevBlocked.delete(user.uuid);
            return prevBlocked;
        }
        APIUnblock(user_ctx.accessToken, user.uuid).then(response => {
            if (response.status === 200) {
                user_ctx.setBlocked(prevBlocked => new Map(UnBlockUser(prevBlocked)));
            }
        })
    }

    return (
        <div className='Friend'>
            <div className='Friend-User'>
                <div className='Friend-Avatar-Container'>
                <img className='Friend-Avatar' src={user.avatar} alt={"Avatar"} onError={setDefaultAvatar} />
                </div>
                <h3 className='Friend-Name'>{user.username}</h3>
            </div>
            <div className='Friend-Actions-Container'>
            <button className='Friend-Actions Friend-Actions-Decline' onClick={UnBlock}><FontAwesomeIcon icon={faUserXmark} /></button>
            </div>
        </div>
    )
}

export default Block;