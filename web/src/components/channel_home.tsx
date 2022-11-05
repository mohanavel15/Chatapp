import { useState, useContext, useEffect, useRef } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import Relationship from './relationship';
import { RelationshipToFriend } from '../api/relationship';

function ChannelHome() {
	const user_ctx:UserContextOBJ = useContext(UserContext);
	const [TopBarSelected, setTopBarSelected] = useState(0)
	const [elements, setElements] = useState<JSX.Element[]>([]);
	const ctx_menu_context: ContextMenuCtx = useContext(ContextMenu);

	const FriendUserUUID = useRef<HTMLInputElement>(undefined!);

	useEffect(() => {
		setElements([])
		user_ctx.relationships.forEach(relationship => {
			let add_friend_element: boolean = false;
			if (TopBarSelected === 0 && relationship.type === 1 && relationship.status > 0) {
				add_friend_element = true
			}
			if (TopBarSelected === 1 && relationship.type === 1) {
				add_friend_element = true
			}

			if (TopBarSelected === 2 && (relationship.type === 3 || relationship.type === 4)) {
				add_friend_element = true
			}

			if (TopBarSelected === 3 && relationship.type === 2) {
				add_friend_element = true
			}

			if (add_friend_element) {
				setElements(prevElements => [...prevElements, 
				<div key={relationship.id} onContextMenu={
					(event) => {
						event.preventDefault();
						ctx_menu_context.closeAll();
						ctx_menu_context.setFriendCtxMenu({x: event.clientX, y: event.clientY, friend_obj: relationship})
						ctx_menu_context.setShowFriendCtxMenu(true);
					}
				}>
				<Relationship relationship_obj={relationship} />
				</div>
				])
			}
		})
	}, [TopBarSelected, user_ctx.relationships])

	const active_button_style: React.CSSProperties = {
        backgroundColor: "#393d42",
    }

	function SendFriendRequest() {
		if (FriendUserUUID.current !== undefined) {
			if (FriendUserUUID.current.value !== "") {
				RelationshipToFriend(FriendUserUUID.current.value).then(relationship => {
					user_ctx.setRelationships(prevRelationship => new Map(prevRelationship.set(relationship.id, relationship)));
				})
				FriendUserUUID.current.value = ""
			}
		}
	}
	
	return (
		<div className="Friends">
			<div className='Friends-Top-Bar'>
				{TopBarSelected === 0 && <button className='Friends-Top-Bar-Button' style={active_button_style} onClick={() => {setTopBarSelected(0)}}>Online</button> }
				{TopBarSelected !== 0 && <button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(0)}}>Online</button> }
				
				{TopBarSelected === 1 && <button className='Friends-Top-Bar-Button' style={active_button_style} onClick={() => {setTopBarSelected(1)}}>All</button> }
				{TopBarSelected !== 1 && <button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(1)}}>All</button> }
				
				{TopBarSelected === 2 && <button className='Friends-Top-Bar-Button' style={active_button_style} onClick={() => {setTopBarSelected(2)}}>Pending</button> }
				{TopBarSelected !== 2 && <button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(2)}}>Pending</button> }

				{TopBarSelected === 3 && <button className='Friends-Top-Bar-Button' style={active_button_style} onClick={() => {setTopBarSelected(3)}}>Blocked</button> }
				{TopBarSelected !== 3 && <button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(3)}}>Blocked</button> }
				
				{TopBarSelected === 4 && <button className='Friends-Top-Bar-Button FTB-AddButton' style={active_button_style} onClick={() => {setTopBarSelected(4)}}>Add Friend</button> }
				{TopBarSelected !== 4 && <button className='Friends-Top-Bar-Button FTB-AddButton' onClick={() => {setTopBarSelected(4)}}>Add Friend</button> }
			</div>
				{TopBarSelected === 0 && <h3 className='Friends-List-Title'>Online — {elements.length}</h3>}
				{TopBarSelected === 1 && <h3 className='Friends-List-Title'>All — {elements.length}</h3>}
				{TopBarSelected === 2 && <h3 className='Friends-List-Title'>Pending — {elements.length}</h3>}
				{TopBarSelected === 3 && <h3 className='Friends-List-Title'>Blocked — {elements.length}</h3>}
				{TopBarSelected === 4 && 
				<div className='add-friend-container'>
					<div className='add-friend-input-container'>
						<input className='add-friend-input' type='text' placeholder='User UUID' ref={FriendUserUUID} />
						<button className='add-friend-button' onClick={SendFriendRequest}>Send Friend Request</button>
					</div>
				</div>
				}
			<div className='Friends-List'>
				{elements}
			</div>
		</div>
	)
}

export default ChannelHome;