import { useContext, useEffect, useRef, useState } from "react";
import { StatesContext, StateContext } from "../contexts/states";
import { ChannelsContext, ChannelContext } from '../contexts/channelctx';
import axios from "axios";
import Member from "./member";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { InviteOBJ, BanOBJ } from "../models/models";
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

export default function EditChannel() {
    const user:UserContextOBJ = useContext(UserContext);
    const state_context: StateContext = useContext(StatesContext);
    const channel_context: ChannelContext = useContext(ChannelsContext);
    const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);
    
    const [channelEditSection, setChannelEditSection] = useState(0);
    const [membersElement, setMembersElement] = useState<JSX.Element[]>([]);
    const [invites, setInvites] = useState<JSX.Element[]>([]);
    const [bans, setBans] = useState<JSX.Element[]>([]);

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
						ctx_menu_context.setMemberCtxMenuLocation({event: event, member: member, channel: state_context.ChannelOBJ});
						ctx_menu_context.setShowMemberCtxMenu(true);
					}
          		}>
          		<Member member_obj={member} />
          		</div>])
            })
        }
    }, []);

    useEffect(() => {
        setInvites([]);
        axios.get<InviteOBJ[]>(`http://127.0.0.1:5000/channels/${state_context.ChannelOBJ.uuid}/invites`, {
            headers: {
                'Authorization': user.accessToken
            }
        }).then(res => {
            res.data.forEach(invite => {
                setInvites(prevInvites => [...prevInvites,
                <div className="invites">
                    <p className="invite-code">{invite.invite_code}</p>
                    <p className="invite-date">{invite.created_at}</p>
                </div>
                ])
            })
        })
    }, []);

    useEffect(() => {
        setBans([]);
        axios.get<BanOBJ[]>(`http://127.0.0.1:5000/channels/${state_context.ChannelOBJ.uuid}/bans`, {
            headers: {
                'Authorization': user.accessToken
            }
        }).then(res => {
            res.data.forEach(ban => {
                setBans(prevBans => [...prevBans,
                <div className="bans">
                    <p className="">{ban.banned_user.username}</p>
                </div>
                ])
            })
        })
    }, []);


    const channel_name = useRef<HTMLInputElement>(undefined!);
    const channel_icon = useRef<HTMLInputElement>(undefined!);
    function HandleCreateChannel(e: React.MouseEvent<Element, MouseEvent>) {
        e.preventDefault();
        const channel_name_value = channel_name.current.value;
        const channel_icon_value = channel_icon.current.value;
        if (channel_name_value !== "") {
            channel_context.gateway.send(
                JSON.stringify({
                    event: "CHANNEL_MODIFY",
                    data: {
                        uuid: state_context.ChannelOBJ.uuid,
                        name: channel_name_value,
                        icon: channel_icon_value
                    }
                })
            );
        }
    }

    function create_invite() {
        axios.post<InviteOBJ>(`http://127.0.0.1:5000/channels/${state_context.ChannelOBJ.uuid}/invites`, {}, {
            headers: {
                'Authorization': user.accessToken
            }
        }).then(res => {
            setInvites(prevInvites => [...prevInvites,
            <div className="invites">
                <p className="invite-code">{res.data.invite_code}</p>
                <p className="invite-date">{res.data.created_at}</p>
            </div>
            ])
        })
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
                    <input className="channel-edit-input" ref={channel_icon} type="text" placeholder="Url For Channel Icon" defaultValue={state_context.ChannelOBJ.icon}/>
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
