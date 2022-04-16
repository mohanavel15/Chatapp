import { useContext, useRef } from 'react';
import { StatesContext, StateContext } from "../contexts/states";
import ToggleBtn from '../utils/togglebtn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from "../contexts/usercontext";
import axios from 'axios';

function Settings() {
    const state_context: StateContext = useContext(StatesContext);
    const user_ctx = useContext(UserContext);

    const avatar_ref = useRef<HTMLInputElement>(undefined!);

    const password_ref = useRef<HTMLInputElement>(undefined!);
    const new_password_ref = useRef<HTMLInputElement>(undefined!);
    const confirm_password_ref = useRef<HTMLInputElement>(undefined!);

    const who_can_dm_ref = useRef<HTMLInputElement>(undefined!);

    function avatar() {
        axios.patch("http://127.0.0.1:5000/users/@me", {"avatar": avatar_ref.current.value}, {
            headers: {
                authorization: user_ctx.accessToken
            }
        }).then(response => {
            if (response.status === 200) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        })
    }

    function logout(signout: boolean) {
        let url = "http://127.0.0.1:5000/logout";
        if (signout) {
            url = "http://127.0.0.1:5000/signout";
        }
        axios.post(url, {}, {
            headers: {
                authorization: user_ctx.accessToken
            }
        }).then(response => {
            if (response.status === 200) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        })
    }

    function changePassword() {
        if (password_ref.current.value === "") {
            alert("Please enter your password");
            return;
        }
        if (new_password_ref.current.value === confirm_password_ref.current.value) {
            alert("not implemented")
            return;
        } else {
            alert("New password and confirm password is not match");
            return;
        }
        
    }

    function who_can_dm() {
        console.log("Toggle Value:", who_can_dm_ref.current.checked);
        alert("not implemented")
    }

    return (
        <div className='settings'>
            <div className='settings-header'>
                <h2>Settings</h2>
                <button className='settings-close' onClick={() => state_context.setSettings(false)}> <FontAwesomeIcon icon={faX} /> </button>
            </div>
            <div className='settings-content'>
                <div className='settings-content-item'>
                <h3 className='settings-content-item-title'>Profile</h3>
                <input type="text" placeholder='avatar' defaultValue={user_ctx.avatar} ref={avatar_ref} />
                <button className='btn-green' onClick={avatar}>Save</button>
                </div>
                <div className='settings-content-item'>
                <h3 className='settings-content-item-title'>Chanage Password</h3>
                <input type="password" placeholder='Current Password' ref={password_ref} />
                <input type="password" placeholder='New Password' ref={new_password_ref} />
                <input type="password" placeholder='Retype New Password' ref={confirm_password_ref} />
                <button className='btn-green' onClick={changePassword}>Save</button>
                </div>
                <div className='settings-content-item'>
                <h3 className='settings-content-item-title'>DMs</h3>
                <ToggleBtn input_ref={who_can_dm_ref}> Only Friends Can Dm </ToggleBtn>
                <button className='btn-green' onClick={who_can_dm}>Save</button>
                </div>
                <div className='settings-content-item'>
                <h3 className='settings-content-item-title'>Logout</h3>
                <button className='btn-red' onClick={() => logout(false)}>Logout</button> 
                <button className='btn-red' onClick={() => logout(true)}>Sign out</button>
                </div>
            </div>
        </div>
    )
}

export default Settings;