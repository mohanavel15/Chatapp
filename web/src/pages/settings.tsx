import { useContext, useRef } from 'react';
import ToggleBtn from '../utils/togglebtn';
import { UserContext } from "../contexts/usercontext";
import { useNavigate } from "react-router-dom";
import Routes from '../config';
import { ChangePassword, Logout } from '../api/auth';
import { setDefaultAvatar } from '../utils/errorhandle';
import { HiCamera, HiXCircle } from 'react-icons/hi';
import SettingsItem from '../components/settings/SettingsItem';

function Settings() {
    const naviagte = useNavigate();
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
            let reader = new FileReader();
            reader.readAsDataURL(avatar_input.current.files[0]);
            reader.onload = () => {
                console.log(reader.result);
                fetch(Routes.currentUser, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ avatar: reader.result })
                }).then(response => {
                    if (response.status === 200) {
                        alert("Successfully updated avatar!")
                    }
                })
            }
        }
    }

    function logout() {
        Logout().then(response => {
            if (response.status === 200) {
                navigate("/auth/login");
            }
        })
    }

    function changePassword() {
        if (password_ref.current.value === "") {
            alert("Please enter your password");
            return;
        }
        if (new_password_ref.current.value === confirm_password_ref.current.value) {
            ChangePassword(password_ref.current.value, new_password_ref.current.value).then(response => {
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
                avatar_input.current.value = ''
                return
            }
            avatar_image.current.src = URL.createObjectURL(file);
        }
    }

    return (
        <div className='h-full w-full overflow-hidden flex flex-col'>
            <div className='h-16 flex items-center justify-around bg-zinc-900'>
                <h2>Settings</h2>
                <button onClick={() => naviagte(-1)}><HiXCircle className='hover:text-gray-600' size={42} /></button>
            </div>
            <div className='flex flex-col h-full w-full items-center overflow-y-scroll'>
                <SettingsItem title='Profile'>
                    <div className="relative flex items-center justify-center h-32 w-32">
                        <img onClick={() => avatar_input.current.click()} src={user_ctx.avatar} onError={setDefaultAvatar} className="h-24 w-24 rounded-xl bg-zinc-900 cursor-pointer p-0 m-2 border-slate-300 border-2 border-dashed" ref={avatar_image} alt="icon" />
                        <HiCamera size={64} onClick={() => avatar_input.current.click()} className="absolute self-center justify-self-center text-white opacity-75 cursor-pointer" />
                        <input type="file" ref={avatar_input} name="filename" hidden onChange={onIconChange} accept="image/*"></input>
                    </div>
                    <button className='w-24 h-10 bg-green-700 rounded hover:bg-green-800' onClick={avatar}>Save</button>
                </SettingsItem>
                <SettingsItem title='Chanage Password'>
                    <input className="h-8 w-4/5 rounded my-1 px-2 bg-zinc-800" type="password" placeholder='Current Password' ref={password_ref} />
                    <input className="h-8 w-4/5 rounded my-1 px-2 bg-zinc-800" type="password" placeholder='New Password' ref={new_password_ref} />
                    <input className="h-8 w-4/5 rounded my-1 px-2 bg-zinc-800" type="password" placeholder='Retype New Password' ref={confirm_password_ref} />
                    <button className='w-24 h-10 bg-green-700 rounded hover:bg-green-800 my-1' onClick={changePassword}>Save</button>
                </SettingsItem>
                <SettingsItem title='DMs'>
                    <ToggleBtn input_ref={who_can_dm_ref}> Only Friends Can Dm </ToggleBtn>
                    <ToggleBtn input_ref={who_can_dm_ref}> Only Friends Add To Channel </ToggleBtn>
                    <button className='w-24 h-10 bg-green-700 rounded hover:bg-green-800' onClick={who_can_dm}>Save</button>
                </SettingsItem>
                <SettingsItem title='Logout'>
                    <button className='w-24 h-10 bg-red-800 rounded hover:bg-red-900' onClick={logout}>Logout</button>
                </SettingsItem>
            </div>
        </div>
    )
}

export default Settings;