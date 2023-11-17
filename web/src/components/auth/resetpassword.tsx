import { useContext, useRef, useState } from "react";
import { ResetPassword as APIResetPassword } from "../../api/auth";
import { LoginContext } from "../../contexts/Login";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") || "";

	const navigate = useNavigate();
	const login_ctx = useContext(LoginContext);
	const Password = useRef<HTMLInputElement>(undefined!);
	const ConfirmPassword = useRef<HTMLInputElement>(undefined!);
	const [passwordNotSame, setPasswordNotSame] = useState(false);

	async function HandleResponse(response: Response) {
		if (response.status === 200) {
			login_ctx.setShowError(false);
            login_ctx.setShowError(false);
			alert("Password Changed Successfully!");
			//navigate("/auth/login")
		} else {
            login_ctx.setError("Something went wrong. Please try again.");
            login_ctx.setShowError(true);
        }
        navigate("/auth/login")
	}

	function HandleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		login_ctx.setLoading(true);
		const password_text = Password.current.value
		const confirm_password_text = ConfirmPassword.current.value;

		if (password_text !== confirm_password_text) {
			login_ctx.setError("Password and Confirm Password don't match");
			login_ctx.setShowError(true);
			login_ctx.setLoading(false);
			return
		}

		APIResetPassword(token, password_text).then(response => { HandleResponse(response); login_ctx.setLoading(false) })
  	}

	return (
		<form onSubmit={HandleSubmit} className="h-full flex flex-col items-center justify-evenly">
            <h1> Enter Your New Password: </h1>
			<input className="w-3/4 px-4 h-12 bg-zinc-700" type="password" placeholder="Password" ref={Password} required />
			<input className={`w-3/4 px-4 h-12 bg-zinc-700 border-red-500 ${ passwordNotSame && 'border-2' } `} type="password" placeholder="Confirm Password" onChange={(e) => setPasswordNotSame(e.currentTarget.value !== Password.current.value)} ref={ConfirmPassword} required />
			<button className="w-3/4 h-12 bg-zinc-700" type="submit"> Reset Password </button>
		</form>
	);
}

export default ResetPassword;