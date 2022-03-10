import axios, { AxiosResponse } from "axios";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const Username = useRef<HTMLInputElement>(undefined!);
  const Email = useRef<HTMLInputElement>(undefined!);
  const Password = useRef<HTMLInputElement>(undefined!);

  function HandleResponse(response: AxiosResponse<any, any>) {
    if (response.data === "Successfully registered") {
      alert("Successfully registered!")
      navigate("/login")
    }
  }

  function HandleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const username_text = Username.current.value
    const password_text = Password.current.value
    const email_text = Email.current.value

    axios.post("http://localhost:5000/signup", {"username": username_text,"email": email_text ,"password": password_text}).then(response => {HandleResponse(response)})

  }
    return (
      <div className="Login">
        <div className="register-container">
            <form onSubmit={HandleRegister}>
            <br />
            <h1> Create An Account </h1>
            <p>Username</p>
            <input id="login-input" type="text" placeholder="Username" ref={Username} required/>
            <p>Email</p>
            <input id="login-input" type="email" placeholder="Email" ref={Email} required/>
            <p>Password</p>
            <input id="login-input" type="password" placeholder="Password" ref={Password} required/>
            <button id="login-button" type="submit">Register</button>
            <br />
            <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    </div>
    );
  }
  
export default Register;