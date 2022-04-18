import { useState, useContext, useEffect, useRef } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import Friend from './friend';
import Routes from '../config';

function ChannelHome() {
	const user_ctx:UserContextOBJ = useContext(UserContext);
	const [TopBarSelected, setTopBarSelected] = useState(0)
	const [friends, setFriends] = useState<JSX.Element[]>([]);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	const FriendUserUUID = useRef<HTMLInputElement>(undefined!);

	useEffect(() => {
		setFriends([])
		user_ctx.friends.forEach(friendOBJ => {
			let add_friend_element: boolean = false;
			if (TopBarSelected === 0 && friendOBJ.pending === false && friendOBJ.status > 0) {
				add_friend_element = true
			}
			if (TopBarSelected === 1 && friendOBJ.pending === false) {
				add_friend_element = true
			}

			if (friendOBJ.pending === true && TopBarSelected === 2) {
				add_friend_element = true
			}
			if (add_friend_element) {
				setFriends(prevFriends => [...prevFriends, 
				<div key={friendOBJ.uuid} onContextMenu={
					(event) => {
						event.preventDefault();
						ctx_menu_context.closeAll();
						ctx_menu_context.setFriendCtxMenuLocation({x: event.clientX, y: event.clientY, friend_obj: friendOBJ})
						ctx_menu_context.setShowFriendCtxMenu(true);
					}
				}>
				<Friend friend_obj={friendOBJ} />
				</div>
				])
			}
		})
	}, [TopBarSelected, user_ctx.friends])

	function SendFriendRequest() {
		if (FriendUserUUID.current !== undefined) {
			if (FriendUserUUID.current.value !== "") {
				fetch(Routes.Friends, {
					method: "POST",
					headers: {
						"Authorization": user_ctx.accessToken,
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						"to": FriendUserUUID.current.value
					})
				}).then(response => {
					if (response.status === 200) {
						FriendUserUUID.current.value = ""
					}
				})
			}
		}
	}


	return (
		<div className="Friends">
			<div className='Friends-Top-Bar'>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(0)}}>Online</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(1)}}>All</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(2)}}>Pending</button>
				<button className='Friends-Top-Bar-Button FTB-AddButton' onClick={() => {setTopBarSelected(3)}}>Add Friend</button>
			</div>
				{TopBarSelected === 0 && <h3 className='Friends-List-Title'>Online — {friends.length}</h3>}
				{TopBarSelected === 1 && <h3 className='Friends-List-Title'>All — {friends.length}</h3>}
				{TopBarSelected === 2 && <h3 className='Friends-List-Title'>Pending — {friends.length}</h3>}
				{TopBarSelected === 3 && 
				<div className='add-friend-container'>
					<div className='add-friend-input-container'>
						<input className='add-friend-input' type='text' placeholder='User UUID' ref={FriendUserUUID} />
						<button className='add-friend-button' onClick={SendFriendRequest}>Send Friend Request</button>
					</div>
				</div>
				}
			<div className='Friends-List'>
				{friends}
			</div>
		</div>
	)
}

export default ChannelHome;