import { useContext, useEffect, useRef, useState } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import Member from "./member";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { InviteOBJ, BanOBJ } from "../models/models";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faCamera } from '@fortawesome/free-solid-svg-icons'
import { setDefaultAvatar } from "../utils/errorhandle";
import Routes from "../config";

function Invite({ invite, onDelete }: { invite: InviteOBJ, onDelete: (invite_code: string) => void }) {
    return (
    <div className="invites">
        <p className="invite-code">{invite.invite_code}</p>
        <div className="invite-date-and-delete-button"><p className="invite-date">{invite.created_at}</p><button className="delete-invite-button" onClick={() => {onDelete(invite.invite_code)}}><FontAwesomeIcon icon={faTrashCan} /></button></div>
    </div>
    )
}

export default function EditChannel() {
    const user:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
    
    const [channelEditSection, setChannelEditSection] = useState(0);
    const [membersElement, setMembersElement] = useState<JSX.Element[]>([]);
    const [invites, setInvites] = useState<JSX.Element[]>([]);
    const [bans, setBans] = useState<JSX.Element[]>([]);

    const [banReload, setBanReload] = useState(false);
    const [InviteReload, setInviteReload] = useState(false);

    const icon_input = useRef<HTMLInputElement>(undefined!);
    const icon_image = useRef<HTMLImageElement>(undefined!);

    useEffect(() => {
        setMembersElement([]);
        const members = channel_context.members.get(state_context.ChannelOBJ.uuid)
        if (members) {
            members.forEach(member => {
                setMembersElement(prevMembers => [...prevMembers,
                <div key={member.uuid} onContextMenu={
					(event) => {
						event.preventDefault();
						ctx_menu_context.closeAll();
						ctx_menu_context.setMemberCtxMenu({event: event, member: member, channel: state_context.ChannelOBJ});
						ctx_menu_context.setShowMemberCtxMenu(true);
					}
          		}>
          		<Member member_obj={member} />
          		</div>])
            })
        }
    }, [channel_context.members]);

    useEffect(() => {
        setInvites([]);
        const url = Routes.Channels + "/" + state_context.ChannelOBJ.uuid + "/invites";
        fetch(url, {
            method: "GET",
            headers: {
                'Authorization': user.accessToken
            }
        }).then(res => {
            if (res.status === 200) {
                res.json().then((invites: InviteOBJ[]) => {
                    setInvites(prevInvites => [...prevInvites, ...invites.map(invite => <Invite invite={invite} onDelete={delete_invite} />)])
                })
            }
        })
    }, [InviteReload]);

    function Unban(ban_id: string) {
        const url = Routes.Channels + "/" + state_context.ChannelOBJ.uuid + "/bans/" + ban_id;
        fetch(url, {
            method: "DELETE",
            headers: {
                'Authorization': user.accessToken
            }
        }).then(response => {
            if (response.status === 200) {
                setBanReload(prevBanReload => !prevBanReload);
            }
        })
    }

    useEffect(() => {
        setBans([]);
        const url = Routes.Channels + "/" + state_context.ChannelOBJ.uuid + "/bans";
        fetch(url, {
            method: "GET",
            headers: {
                'Authorization': user.accessToken
            }
        }).then(response => {
            if (response.status === 200) {
                response.json().then((bans: BanOBJ[]) => {
                    bans.forEach(ban => {
                        setBans(prevBans => [...prevBans,
                        <div className="bans">
                            <div className="ban-container">
                                <div className="ban-user-container">
                                    <img className="ban-avatar" src={ban.banned_user.avatar} alt="BannedUserAvatar" onError={setDefaultAvatar} />
                                    <p>{ban.banned_user.username}</p>
                                </div>
                                <div className="ban-action">
                                    <button className="delete-invite-button" onClick={() => {Unban(ban.uuid)}}><FontAwesomeIcon icon={faTrashCan} /></button>
                                </div>
                            </div>
                            <div className="ban-container">
                                <h4>Reason:</h4>
                                <p>{ban.reason}</p>
                            </div>
                            <div className="ban-container">
                                <h4>Banned By:</h4>
                                <p className="ban-by-username">{ban.banned_by.username}</p>
                            </div>
                        </div>
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

        if (channelName === "") {
            return
        }

        if (icon_input.current.files && icon_input.current.files.length > 0) {
            const url = Routes.Channels+"/"+state_context.ChannelOBJ.uuid;
            const formData = new FormData();
            formData.append('name', channelName);
            formData.append('file', icon_input.current.files[0]);
            fetch(url, {
                method: "PATCH",
                headers: {
                    "Authorization": user.accessToken,
                },
                body: formData
            })
        }
    }
 
    function create_invite() {
        const url = Routes.Channels + "/" + state_context.ChannelOBJ.uuid + "/invites";
        fetch(url, {
            method: "POST",
            headers: {
                'Authorization': user.accessToken
            }
        }).then(res => {
            if (res.status === 200) {
                res.json().then((invite: InviteOBJ) => {
                    setInvites(prevInvites => [...prevInvites, <Invite invite={invite} onDelete={delete_invite} />])
                })
            }
        })
    }

    function delete_invite(invite_code: string) {
        const url = Routes.Channels +  `/${state_context.ChannelOBJ.uuid}/invites/${invite_code}`;
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': user.accessToken
            }
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
                icon_input.current.value=''
                return
            }
            icon_image.current.src = URL.createObjectURL(file);
        }
    }

    return (
        <div className="channel-edit">
            <div className="channel-edit-sidebar">
                <button className="channel-edit-side-bar-btn" onClick={() => {setChannelEditSection(0)}}>Overview</button>
                <button className="channel-edit-side-bar-btn" onClick={() => {setChannelEditSection(1)}}>Invites</button>
                <button className="channel-edit-side-bar-btn" onClick={() => {setChannelEditSection(2)}}>Members</button>
                <button className="channel-edit-side-bar-btn" onClick={() => {setChannelEditSection(3)}}>Bans</button>
                <button className="channel-edit-side-bar-btn" onClick={() => {state_context.setEditChannel(false)}}>Close</button>
            </div>
            <div className="channel-edit-main">
                { channelEditSection === 0 &&
                    <>
                    <input className="channel-edit-input" ref={channel_name} type="text" placeholder="Channel Name" defaultValue={state_context.ChannelOBJ.name}/>
                    <div className="channel-edit-icon-container">
                        <img className="channel-edit-icon" ref={icon_image} src={state_context.ChannelOBJ.icon} />
                        <FontAwesomeIcon icon={faCamera} className="channel-edit-icon-camera" onClick={() => icon_input.current.click()} />
				        <input type="file" ref={icon_input} name="filename" hidden onChange={onIconChange} accept="image/*"></input>
                    </div>
                    <button className="create-channel-create-button" onClick={HandleCreateChannel}>Save</button>
                    </>
                }
                { channelEditSection === 1 &&
                    <>
                    <div className="channel-edit-top-bar">
                        <h3 className="channel-edit-title">Invites—{invites.length}</h3>
                        <button className="create-invite-btn" onClick={create_invite}>Create Invite</button>
                    </div>
                    {invites}
                    </>
                }
                { channelEditSection === 2 &&
                    <>
                    <div className="channel-edit-top-bar">
                    <h3 className="channel-edit-title">Members—{membersElement.length}</h3>
                    </div>
                    {membersElement}
                    </>
                }
                { channelEditSection === 3 &&
                    <>
                    <div className="channel-edit-top-bar">
                    <h3 className="channel-edit-title">Bans—{bans.length}</h3>
                    </div>
                    {bans}
                    </>
                }
            </div>
        </div>

    )
}
