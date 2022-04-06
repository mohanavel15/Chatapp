import { useState, useContext, useEffect } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import Friend from './friend';

function ChannelHome() {
	const user_ctx:UserContextOBJ = useContext(UserContext);
	const [TopBarSelected, setTopBarSelected] = useState(0)
	const [friends, setFriends] = useState<JSX.Element[]>([]);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

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


	return (
		<div className="Friends">
			<div className='Friends-Top-Bar'>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(0)}}>Online</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(1)}}>All</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(2)}}>Pending</button>
				<button className='Friends-Top-Bar-Button FTB-AddButton'>Add Friend</button>
			</div>
				{TopBarSelected === 0 && <h3 className='Friends-List-Title'>Online — {friends.length}</h3>}
				{TopBarSelected === 1 && <h3 className='Friends-List-Title'>All — {friends.length}</h3>}
				{TopBarSelected === 2 && <h3 className='Friends-List-Title'>Pending — {friends.length}</h3>}
			<div className='Friends-List'>
				{friends}
			</div>
		</div>
	)
}

export default ChannelHome;