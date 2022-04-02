import { useState, useContext, useEffect } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";

function ChannelHome() {
	const user_ctx:UserContextOBJ = useContext(UserContext);
	const [TopBarSelected, setTopBarSelected] = useState(0)
	const [friends, setFriends] = useState<JSX.Element[]>([]);

	useEffect(() => {
		setFriends([])
		user_ctx.friends.forEach(friendOBJ => {
			console.log(friendOBJ)
			if (friendOBJ.pending === true && TopBarSelected == 2) {
				setFriends(prevFriends => [...prevFriends, 
					<h3 key={friendOBJ.user.uuid}>{friendOBJ.user.username}</h3>
				])
			}
		})
	}, [TopBarSelected])


	return (
		<div className="Friends">
			<div className='Friends-Top-Bar'>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(0)}}>Online</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(1)}}>All</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(2)}}>Pending</button>
				<button className='Friends-Top-Bar-Button' onClick={() => {setTopBarSelected(3)}}>Blocked</button>
				<button className='Friends-Top-Bar-Button FTB-AddButton'>Add Friend</button>
			</div>
			<div className='Friends-List'>
				{TopBarSelected === 0 && <h3 className='Friends-List-Title'>Online—{friends.length}</h3>}
				{TopBarSelected === 1 && <h3 className='Friends-List-Title'>All—{friends.length}</h3>}
				{TopBarSelected === 2 && <h3 className='Friends-List-Title'>Pending—{friends.length}</h3>}
				{TopBarSelected === 3 && <h3 className='Friends-List-Title'>Blocked—{friends.length}</h3>}
				{friends}
			</div>
		</div>
	)
}

export default ChannelHome;