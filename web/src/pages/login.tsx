import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Login as APILogin } from "../api/auth";

function Login() {
	const Username = useRef<HTMLInputElement>(undefined!);
	const Password = useRef<HTMLInputElement>(undefined!);
	const navigate = useNavigate();

	const [error, setError] = useState<string>('');
	const [showError, setShowError] = useState<boolean>(false);
	
	const [loading, setLoading] = useState<boolean>(false);

	async function HandleResponse(response: Response) {
		if (response.status === 200) {
			setShowError(false);
			navigate("/channels/@me");
		} else {
			setShowError(true);
			response.text().then(text => {
				setError(text);
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
		<div className="Login">
			{ showError && <div className='error-message-container'>{ error }</div> }
			<div className="login-container">
				{ loading && <div className="loading-animation"></div> }
				{ !loading && 
				<form onSubmit={HandleLogin}>
					<br />
					<h1> Welcome Back! </h1>
					<p>Username</p>
					<input id="login-input" type="text" placeholder="Username" ref={Username} required />
					<p>Password</p>
					<input id="login-input" type="password" placeholder="Password" ref={Password} required />
					<button id="login-button" type="submit"> Login </button>
					<br />
					<p>Don't have an account? <Link to="/register">Register</Link></p>
				</form>
				}
			</div>
		</div>
	);
}

export default Login;