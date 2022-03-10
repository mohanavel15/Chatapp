import { useEffect, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const Username = useRef<HTMLInputElement>(undefined!);
  const Password = useRef<HTMLInputElement>(undefined!);
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (access_token !== null && access_token !== "" && access_token !== "undefined" && access_token !== undefined) {
      navigate("/channels/123");
    }
  });

  function HandleResponse(response: AxiosResponse<any, any>) {
    if (response.status === 200) {
      const obj = response.data
      const access_token = obj.access_token
      const client_token = obj.client_token
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("client_token", client_token)
      navigate("/channels/@me");
    }
  }

  function HandleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const username_text = Username.current.value
    const password_text = Password.current.value
    if (username_text === undefined || password_text === undefined) {
      return;
    }

    axios.post("http://localhost:5000/signin", {"username": username_text,"password": password_text}).then(response => {HandleResponse(response)})

  }
    return (
      <div className="Login">
        <div className="login-container">
            <form onSubmit={HandleLogin}>
            <br />
            <h1> Welcome Back! </h1>
            <p>Username</p>
            <input id="login-input" type="text" placeholder="Username" ref={Username} required />
            <p>Password</p>
            <input id="login-input" type="password" placeholder="Password" ref={Password} required  />
            <button id="login-button" type="submit"> Login </button>
            <br />
            <p>Don't have an account? <Link to="/register">Register</Link></p>
            </form>

        </div>
    </div>
    );
  }
  
export default Login;