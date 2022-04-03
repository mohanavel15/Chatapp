import { useState, useContext, useEffect } from 'react'
import { UserContextOBJ, UserContext } from "../contexts/usercontext";
import Friend from './friend';

function ChannelHome() {
	const user_ctx:UserContextOBJ = useContext(UserContext);
	const [TopBarSelected, setTopBarSelected] = useState(0)
	const [friends, setFriends] = useState<JSX.Element[]>([]);

	useEffect(() => {
		setFriends([])
		user_ctx.friends.forEach(friendOBJ => {
			console.log(friendOBJ)
			if (TopBarSelected === 0 && friendOBJ.pending === false && friendOBJ.status > 0) {
				setFriends(prevFriends => [...prevFriends, 
					<Friend key={friendOBJ.uuid} friend_obj={friendOBJ} />
				])
			}
			if (TopBarSelected === 1 && friendOBJ.pending === false) {
				setFriends(prevFriends => [...prevFriends, 
					<Friend key={friendOBJ.uuid} friend_obj={friendOBJ} />
				])
			}

			if (friendOBJ.pending === true && TopBarSelected === 2) {
				setFriends(prevFriends => [...prevFriends, 
					<Friend key={friendOBJ.uuid} friend_obj={friendOBJ} />
				])
			}
		})
		console.log(friends)
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