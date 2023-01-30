import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Login as APILogin } from "../api/auth";
import { LoginContext } from "../contexts/Login";
import { UserContext } from "../contexts/usercontext";

function Login() {
	const login_ctx = useContext(LoginContext);

	const Username = useRef<HTMLInputElement>(undefined!);
	const Password = useRef<HTMLInputElement>(undefined!);
	
	const [loading, setLoading] = useState<boolean>(false);

	async function HandleResponse(response: Response) {
		if (response.status === 200) {
			login_ctx.setShowError(false);
			useNavigate()("/")
		} else {
			login_ctx.setShowError(true);
			response.text().then(text => {
				login_ctx.setError(text);
			});
		}
	}

	function HandleLogin(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		const username_text = Username.current.value
		const password_text = Password.current.value
		if (username_text === undefined || password_text === undefined) {
			return;
		}
		APILogin(username_text, password_text).then(response => { HandleResponse(response); setLoading(false) })
  	}

	return (
		<form onSubmit={HandleLogin} className="h-full flex flex-col items-center justify-evenly">
			<h1> Welcome Back! </h1>
			<input className="w-3/4 h-12 bg-zinc-700" type="text" placeholder="Username" ref={Username} required />
			<input className="w-3/4 h-12 bg-zinc-700" type="password" placeholder="Password" ref={Password} required />
			<button className="w-3/4 h-12 bg-zinc-700" type="submit"> Login </button>
		</form>
	);
}

export default Login;