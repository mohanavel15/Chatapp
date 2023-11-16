import { useState, useContext, useEffect, useRef } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import { RelationshipToFriend } from '../api/relationship';
import Relationship from '../components/relationships/relationship';

function Relationships() {
	const user_ctx:UserContextOBJ = useContext(UserContext);
	const [TopBarSelected, setTopBarSelected] = useState(0)
	const [elements, setElements] = useState<JSX.Element[]>([]);
	
	const FriendUsername = useRef<HTMLInputElement>(undefined!);

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
					<Relationship key={relationship.id} relationship_obj={relationship} />
				])
			}
		})
	}, [TopBarSelected, user_ctx.relationships])

	function SendFriendRequest() {
		if (FriendUsername.current !== undefined) {
			if (FriendUsername.current.value !== "") {
				RelationshipToFriend(FriendUsername.current.value).then(relationship => {
					user_ctx.setRelationships(prevRelationship => new Map(prevRelationship.set(relationship.id, relationship)));
				})
				FriendUsername.current.value = ""
			}
		}
	}
	
	return (
		<div className="relative h-full overflow-hidden w-full">
			<div className='h-12 flex justify-evenly md:justify-start items-center border-b border-zinc-800'>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 0 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(0)}}>Online</button>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 1 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(1)}}>All</button> 
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 2 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(2)}}>Pending</button>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 3 && "bg-zinc-700" } hover:bg-zinc-800`} onClick={() => {setTopBarSelected(3)}}>Blocked</button>
				<button className={`mx-2 p-1 rounded cursor-pointer ${ TopBarSelected === 4 ? "bg-green-600" : "text-green-500" }`} onClick={() => {setTopBarSelected(4)}}>Add</button>
			</div>
			{TopBarSelected === 0 && <h3>Online — {elements.length}</h3>}
			{TopBarSelected === 1 && <h3>All — {elements.length}</h3>}
			{TopBarSelected === 2 && <h3>Pending — {elements.length}</h3>}
			{TopBarSelected === 3 && <h3>Blocked — {elements.length}</h3>}
			<div className='flex flex-col overflow-y-scroll h-full w-full items-center'>
				{TopBarSelected === 4 && 
					<div className='w-11/12 md:w-2/5 flex flex-col md:flex-row items-center mt-8 bg-zinc-900 rounded p-1'>
						<input className='h-8 w-full md:w-3/4 bg-zinc-900 outline-none' type='text' placeholder='user id' ref={FriendUsername} />
						<button className='h-8 w-full md:w-1/4 bg-green-600 rounded m-1' onClick={SendFriendRequest}>Add</button>
					</div>
				}
				{elements}
			</div>
		</div>
	)
}

export default Relationships;