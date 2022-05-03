import { useContext } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from '@fortawesome/free-solid-svg-icons'
import { StatesContext, StateContext } from "../contexts/states";

function Profile() {
    const state_context: StateContext = useContext(StatesContext);

    return (
        <div className='channel-container'>
            <div className='profile-box'>
                <button className='profile-close-btn' onClick={() => { state_context.setShowProfile(false) }}><FontAwesomeIcon icon={faX} /></button>
                <img className='profile-img' src={state_context.ProfileOBJ.avatar} alt='profile' />
                <h3>{state_context.ProfileOBJ.username}</h3>
            </div>
        </div>
    )
}

export default Profile