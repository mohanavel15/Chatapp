import { useState, useContext, useEffect, useRef } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { ContextMenuCtx, ContextMenu } from "../contexts/context_menu_ctx";
import { RelationshipToFriend } from '../api/relationship';
import Relationship from './relationships/relationship';

function Relationships() {
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
		<div className="relative h-full w-full">
			<div className='h-12 flex justify-evenly md:justify-start items-center border-b border-zinc-800'>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 0 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(0)}}>Online</button>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 1 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(1)}}>All</button> 
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 2 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(2)}}>Pending</button>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 3 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(3)}}>Blocked</button>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 4 ? "bg-green-600" : "text-green-500" }`} onClick={() => {setTopBarSelected(4)}}>Add Friend</button>
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
			<div className='relative h-full overflow-y-scroll'>
				{elements}
			</div>
		</div>
	)
}

export default Relationships;