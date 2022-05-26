import { useContext, useRef } from 'react';
import { StatesContext, StateContext } from "../contexts/states";
import ToggleBtn from '../utils/togglebtn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faCamera } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from "../contexts/usercontext";
import { useNavigate } from "react-router-dom";
import Routes from '../config';

function Settings() {
    const state_context: StateContext = useContext(StatesContext);
    const user_ctx = useContext(UserContext);

    const password_ref = useRef<HTMLInputElement>(undefined!);
    const new_password_ref = useRef<HTMLInputElement>(undefined!);
    const confirm_password_ref = useRef<HTMLInputElement>(undefined!);

    const who_can_dm_ref = useRef<HTMLInputElement>(undefined!);

    const avatar_input = useRef<HTMLInputElement>(undefined!);
    const avatar_image = useRef<HTMLImageElement>(undefined!);

    const navigate = useNavigate();

    function avatar() {
        if (avatar_input.current.files && avatar_input.current.files.length > 0) {
            const formData = new FormData();
            formData.append('file', avatar_input.current.files[0]);
            fetch(Routes.currentUser, {
                method: "PATCH",
                headers: {
                    "Authorization": user_ctx.accessToken
                },
                body: formData
            }).then(response => {
                if (response.status === 200) {
                    alert("Successfully updated avatar!")
                }
            })
        }
    }

    function logout(signout: boolean) {
        let url = Routes.logout;
        if (signout) {
            url = Routes.signout;
        }
        
        fetch(url, {
            method: "POST",
            headers: {
                "Authorization": user_ctx.accessToken
            }
        }).then(response => {
            if (response.status === 200) {
                localStorage.removeItem('access_token');
                navigate("/login");
            }
        })
    }

    function changePassword() {
        if (password_ref.current.value === "") {
            alert("Please enter your password");
            return;
        }
        if (new_password_ref.current.value === confirm_password_ref.current.value) {
            fetch(Routes.changePassword, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": user_ctx.accessToken
                },
                body: JSON.stringify({
                    "current_password": password_ref.current.value,
                    "new_password": new_password_ref.current.value
                })
            }).then(response => {
                if (response.status === 200) {
                    alert("Successfully changed password!")
                }
            })
        } else {
            alert("New password and confirm password is not match");
            return;
        }
    }

    function who_can_dm() {
        console.log("Toggle Value:", who_can_dm_ref.current.checked);
        alert("not implemented")
    }

    function onIconChange() {
        if (avatar_input.current.files && avatar_input.current.files.length > 0) {
            const file = avatar_input.current.files[0];
            if (file.size > 2097152) {
                alert("image is bigger than 2MB")
                avatar_input.current.value=''
                return
            }
            avatar_image.current.src = URL.createObjectURL(file);
        }
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
                <div className="channel-edit-icon-container">
                    <img className="channel-edit-icon" ref={avatar_image} src={user_ctx.avatar} />
                    <FontAwesomeIcon icon={faCamera} className="channel-edit-icon-camera" onClick={() => avatar_input.current.click()} />
				    <input type="file" ref={avatar_input} name="filename" hidden onChange={onIconChange} accept="image/*"></input>
                </div>
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