import { useContext, useEffect, useRef, useState } from "react";
import Recipient from "../channel/Recipient";
import { InviteOBJ, BanOBJ, ChannelOBJ } from "../../models/models";
import { setDefaultAvatar, setDefaultIcon } from "../../utils/errorhandle";
import Routes from "../../config";
import { PopUpContext } from "../../contexts/popup";
import { FaTrash } from "react-icons/fa";
import { HiCamera } from "react-icons/hi";

function Invite({ invite, onDelete }: { invite: InviteOBJ, onDelete: (invite_code: string) => void }) {
    return (
        <div className="m-4 h-14 flex bg-zinc-900 rounded items-center w-11/12">
            <p className="w-1/2 text-lg ml-4">{invite.invite_code}</p>
            <div className="w-1/2 flex items-center justify-end">
                <p>{invite.created_at}</p>
                <FaTrash className="h-8 w-8 mx-4 text-red-700 hover:text-red-600 cursor-pointer" onClick={() => onDelete(invite.invite_code)} />
            </div>
        </div>
    )
}

function Ban({ ban, channel_id, setBanReload }: { ban: BanOBJ, channel_id: string, setBanReload: React.Dispatch<React.SetStateAction<boolean>> }) {
    function Unban(ban_id: string) {
        const url = Routes.Channels + "/" + channel_id + "/bans/" + ban_id;
        fetch(url, {
            method: "DELETE",
        }).then(response => {
            if (response.status === 200) {
                setBanReload(prevBanReload => !prevBanReload);
            }
        })
    }

    return (
        <div className="m-4 p-2 flex flex-col bg-zinc-900 rounded w-11/12">
            <div className="flex items-center">
                <div className="w-1/2 flex items-center">
                    <img className="h-10 w-10 rounded mr-2" src={ban.banned_user.avatar} alt="BannedUserAvatar" onError={setDefaultAvatar} />
                    <p>{ban.banned_user.username}</p>
                </div>
                <div className="w-1/2 flex justify-end">
                    <FaTrash size={10} className="h-8 w-8 mr-4 text-red-700 hover:text-red-600 cursor-pointer" onClick={() => Unban(ban.id) } />
                </div>
            </div>
            <div className="flex items-center">
                <h4>Reason:</h4>
                <p>{ban.reason}</p>
            </div>
            <div className="flex items-center">
                <h4>Banned By:</h4>
                <p>{ban.banned_by.username}</p>
            </div>
        </div>
    )
}

export default function EditChannel({ channel }: { channel: ChannelOBJ }) {
    const popup_ctx = useContext(PopUpContext);

    const [channelEditSection, setChannelEditSection] = useState(0);
    const [recipientsElement, setRecipientsElement] = useState<JSX.Element[]>([]);
    const [invites, setInvites] = useState<JSX.Element[]>([]);
    const [bans, setBans] = useState<JSX.Element[]>([]);

    const [banReload, setBanReload] = useState(false);
    const [InviteReload, setInviteReload] = useState(false);

    const icon_input = useRef<HTMLInputElement>(undefined!);
    const icon_image = useRef<HTMLImageElement>(undefined!);

    useEffect(() => {
        setRecipientsElement([]);
        channel.recipients.forEach(recipient => {
            setRecipientsElement(prevRecipient => [...prevRecipient, <Recipient key={recipient.id} user={recipient} channel={channel} />])
        })
    }, [channel]);

    useEffect(() => {
        setInvites([]);
        const url = Routes.Channels + "/" + channel.id + "/invites";
        fetch(url).then(res => {
            if (res.status === 200) {
                res.json().then((invites: InviteOBJ[]) => {
                    setInvites(prevInvites => [...prevInvites, ...invites.map(invite => <Invite invite={invite} onDelete={delete_invite} />)])
                })
            }
        })
    }, [InviteReload]);

    useEffect(() => {
        setBans([]);
        const url = Routes.Channels + "/" + channel.id + "/bans";
        fetch(url).then(response => {
            if (response.status === 200) {
                response.json().then((bans: BanOBJ[]) => {
                    bans.forEach(ban => {
                        setBans(prevBans => [...prevBans,
                            <Ban ban={ban} channel_id={channel.id} setBanReload={setBanReload} />
                        ])
                    })
                })
            }
        })
    }, [banReload]);

    const channel_name = useRef<HTMLInputElement>(undefined!);

    function HandleCreateChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const channelName = channel_name.current.value;

        if (channelName === "") return

        if (icon_input.current.files && icon_input.current.files.length > 0) {
            let reader = new FileReader();
            reader.readAsDataURL(icon_input.current.files[0]);
            reader.onload = () => {
                const url = Routes.Channels + "/" + channel.id;
                fetch(url, {
                    method: "PATCH",
                    body: JSON.stringify({ name: channelName, icon: reader.result })
                })
            }
        }
    }

    function create_invite() {
        const url = Routes.Channels + "/" + channel.id + "/invites";
        fetch(url, {
            method: "POST",
        }).then(res => {
            if (res.status === 200) {
                res.json().then((invite: InviteOBJ) => {
                    setInvites(prevInvites => [...prevInvites, <Invite invite={invite} onDelete={delete_invite} />])
                })
            }
        })
    }

    function delete_invite(invite_code: string) {
        const url = Routes.Channels + `/${channel.id}/invites/${invite_code}`;
        fetch(url, {
            method: 'DELETE',
        }).then(response => {
            if (response.status === 200) {
                setInviteReload(prevInviteReload => !prevInviteReload);
            }
        })
    }

    function onIconChange() {
        if (icon_input.current.files && icon_input.current.files.length > 0) {
            const file = icon_input.current.files[0];
            if (file.size > 2097152) {
                alert("image is bigger than 2MB")
                icon_input.current.value = ''
                return
            }
            icon_image.current.src = URL.createObjectURL(file);
        }
    }

    return (
        <div className="h-full w-full flex bg-black overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="h-full w-64 flex flex-col border-r border-r-neutral-700">
                <button className="m-2 h-8 rounded border-none bg-neutral-700 hover:cursor-pointer hover:bg-neutral-800" onClick={() => { setChannelEditSection(0) }}>Overview</button>
                <button className="m-2 h-8 rounded border-none bg-neutral-700 hover:cursor-pointer hover:bg-neutral-800" onClick={() => { setChannelEditSection(1) }}>Invites</button>
                <button className="m-2 h-8 rounded border-none bg-neutral-700 hover:cursor-pointer hover:bg-neutral-800" onClick={() => { setChannelEditSection(2) }}>Recipients</button>
                <button className="m-2 h-8 rounded border-none bg-neutral-700 hover:cursor-pointer hover:bg-neutral-800" onClick={() => { setChannelEditSection(3) }}>Bans</button>
                <button className="m-2 h-8 rounded border-none bg-neutral-700 hover:cursor-pointer hover:bg-neutral-800" onClick={() => { popup_ctx.close() }}>Close</button>
            </div>
            <div className="h-full w-full flex flex-col items-center md:items-start">
                {channelEditSection === 0 &&
                    <>
                        <input className="bg-zinc-800 h-8 w-11/12 md:w-48" ref={channel_name} type="text" placeholder="Channel Name" defaultValue={channel.name} />
                        <div className="relative flex items-center justify-center h-32 w-32">
                            <img src={channel.icon} onClick={() => icon_input.current.click()} onError={setDefaultIcon} className="h-24 w-24 rounded-xl cursor-pointer p-0 m-2 border-slate-300 border-2 border-dashed" ref={icon_image} alt="icon" />
                            <HiCamera size={64} onClick={() => icon_input.current.click()} className="absolute self-center justify-self-center text-white opacity-75 cursor-pointer" />
                            <input type="file" ref={icon_input} name="filename" hidden onChange={onIconChange} accept="image/*"></input>
                        </div>
                        <button className="h-10 bg-green-600 w-24 rounded hover:bg-green-500" onClick={HandleCreateChannel}>Save</button>
                    </>
                }
                {channelEditSection === 1 &&
                    <>
                        <div className="h-16 w-full flex justify-between">
                            <h3 className="m-4 text-left">Invites—{invites.length}</h3>
                            <button className="h-8 m-4 bg-green-600 px-2 rounded cursor-pointer hover:bg-green-500" onClick={create_invite}>Create Invite</button>
                        </div>
                        {invites}
                    </>
                }
                {channelEditSection === 2 &&
                    <>
                        <div className="h-16 w-full flex justify-between">
                            <h3 className="m-4 text-left">Recipients—{recipientsElement.length}</h3>
                        </div>
                        {recipientsElement}
                    </>
                }
                {channelEditSection === 3 &&
                    <>
                        <div className="h-16 w-full flex justify-between">
                            <h3 className="m-4 text-left">Bans—{bans.length}</h3>
                        </div>
                        {bans}
                    </>
                }
            </div>
        </div>
    )
}
