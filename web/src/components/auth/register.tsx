import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Routes from "../../config";
import { LoginContext } from "../../contexts/Login";

function Register() {
	const navigate = useNavigate();
	const Username = useRef<HTMLInputElement>(undefined!);
	const Email = useRef<HTMLInputElement>(undefined!);
	const Password = useRef<HTMLInputElement>(undefined!);
	const ConfirmPassword = useRef<HTMLInputElement>(undefined!);
	const [passwordNotSame, setPasswordNotSame] = useState(false);

	const login_ctx = useContext(LoginContext)

	function HandleResponse(response: Response) {
		if (response.status === 200) {
			login_ctx.setShowError(false);
			alert("Successfully registered!")
			navigate("/auth/login")
		} else {
			login_ctx.setShowError(true);
			response.text().then(text => {
				login_ctx.setError(text);
			});
		}
	}

	function HandleRegister(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		login_ctx.setLoading(true);
		const username_text = Username.current.value
		const password_text = Password.current.value
		const confirm_password_text = ConfirmPassword.current.value;
		const email_text = Email.current.value

		if (password_text !== confirm_password_text) {
			login_ctx.setError("Password and Confirm Password don't match");
			login_ctx.setShowError(true);
			login_ctx.setLoading(false);
			return
		}

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
		}).then(response => { HandleResponse(response); login_ctx.setLoading(false)})
	}
	return (
		<form onSubmit={HandleRegister} className="h-full flex flex-col items-center justify-evenly">
			<h1> Create An Account </h1>
			<input className="w-3/4 px-4 h-12 bg-zinc-700" type="text" placeholder="Username" ref={Username} required />
			<input className="w-3/4 px-4 h-12 bg-zinc-700" type="email" placeholder="Email" ref={Email} required />
			<input className="w-3/4 px-4 h-12 bg-zinc-700" type="password" placeholder="Password" ref={Password} required />
			<input className={`w-3/4 px-4 h-12 bg-zinc-700 border-red-500 ${ passwordNotSame && 'border-2' } `} type="password" placeholder="Confirm Password" onChange={(e) => setPasswordNotSame(e.currentTarget.value !== Password.current.value)} ref={ConfirmPassword} required />
			<button className="w-3/4 h-12 bg-zinc-700" type="submit">Register</button>
		</form>
	);
}

export default Register;