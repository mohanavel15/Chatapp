import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Routes from "../config";

function Register() {
	const navigate = useNavigate();
	const Username = useRef<HTMLInputElement>(undefined!);
	const Email = useRef<HTMLInputElement>(undefined!);
	const Password = useRef<HTMLInputElement>(undefined!);

	const [error, setError] = useState<string>('');
	const [showError, setShowError] = useState<boolean>(false);

	const [loading, setLoading] = useState<boolean>(false);

	function HandleResponse(response: Response) {
		if (response.status === 200) {
			setShowError(false);
			alert("Successfully registered!")
			navigate("/login")
		} else {
			setShowError(true);
			response.text().then(text => {
				setError(text);
			});
		}
	}

	function HandleRegister(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		const username_text = Username.current.value
		const password_text = Password.current.value
		const email_text = Email.current.value

		fetch(Routes.signup, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"username": username_text,
				"email": email_text,
				"password": password_text
			})
		}).then(response => { HandleResponse(response); setLoading(false)})

	}
	return (
		<div className="Login">
			{ showError && <div className='error-message-container'>{ error }</div> }
			<div className="login-container">
				{ loading && <div className="loading-animation"></div> }
				{ !loading && 
				<form onSubmit={HandleRegister}>
					<br />
					<h1> Create An Account </h1>
					<p>Username</p>
					<input id="login-input" type="text" placeholder="Username" ref={Username} required />
					<p>Email</p>
					<input id="login-input" type="email" placeholder="Email" ref={Email} required />
					<p>Password</p>
					<input id="login-input" type="password" placeholder="Password" ref={Password} required />
					<button id="login-button" type="submit">Register</button>
					<br />
					<p>Already have an account? <Link to="/login">Login</Link></p>
				</form>
				}
			</div>
		</div>
	);
}

export default Register;