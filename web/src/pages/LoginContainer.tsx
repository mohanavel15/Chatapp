import { useContext } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners';
import { LoginContext } from '../contexts/Login'

export default function LoginContainer() {
	const login_ctx = useContext(LoginContext);
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<div className="h-screen w-full flex items-center justify-center">
			<div className={`absolute top-0 m-4 bg-red-600 w-11/12 h-12 ${login_ctx.showError ? 'flex' : 'hidden'} items-center justify-center rounded`}>{login_ctx.error}</div>
			<div className="bg-zinc-900 w-full h-2/3 md:w-1/2 lg:w-1/3 flex flex-col">
				<div className="h-16 flex">
					<button className={`bg-zinc-${location.pathname === "/auth/login" ? "900" : "800"} w-1/2 hover:bg-zinc-600`} onClick={() => navigate("/auth/login")}>Login</button>
					<button className={`bg-zinc-${location.pathname === "/auth/register" ? "900" : "800"} w-1/2 hover:bg-zinc-600`} onClick={() => navigate("/auth/register")}>Register</button>
				</div>
				{ login_ctx.loading ?
					<div className='h-full flex items-center justify-center'>
						<ClipLoader size={128} color="#999999" />
					</div>
					:
					<Outlet />
				}
			</div>
		</div>
	)
}
