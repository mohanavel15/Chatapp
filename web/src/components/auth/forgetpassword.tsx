import { useContext, useRef, useState } from "react";
import { ForgotPassword as APIForgotPassword } from "../../api/auth";
import { LoginContext } from "../../contexts/Login";

function ForgotPassword() {
	const login_ctx = useContext(LoginContext);
	const Email = useRef<HTMLInputElement>(undefined!);
    const [success, setSuccess] = useState(false);

	async function HandleResponse(response: Response) {
		if (response.status === 200) {
			login_ctx.setShowError(false);
            setSuccess(true);
		} else {
            login_ctx.setError("Invalid Email Address");
            login_ctx.setShowError(true);
        }
	}

	function HandleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		login_ctx.setLoading(true);
		const email_text = Email.current.value;
		APIForgotPassword(email_text).then(response => { HandleResponse(response); login_ctx.setLoading(false) })
  	}

	return (
		<form onSubmit={HandleSubmit} className="h-full flex flex-col items-center justify-evenly">
			{ !success && 
            <>
                <h1> Enter Your Email: </h1>
			    <input className="w-3/4 px-4 h-12 bg-zinc-700" type="email" placeholder="Email" ref={Email} required />
			    <button className="w-3/4 h-12 bg-zinc-700" type="submit"> Reset Password </button>
            </> }
            { success && <>
                <h1>Password reset link has been sent to your email!</h1>
            </>}
		</form>
	);
}

export default ForgotPassword;