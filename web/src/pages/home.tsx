import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [Is_Logged_In, setIs_Logged_In] = useState(false);
  const navigate = useNavigate();

  function Goto_Login() {
    navigate("/login");
  }

  function Goto_Channel() {
    navigate("/channels/@me");
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token !== null && token !== "" && token !== undefined && token !== "undefined") {
      setIs_Logged_In(true);
    }
  }, [Is_Logged_In])

  return (
    <div>
      { !Is_Logged_In && <button onClick={Goto_Login}>Login</button> }
      { Is_Logged_In && <button onClick={Goto_Channel}>Open Chat</button> }
      <h1> Hello, World </h1>
    </div>
    );
  }
  
  export default Home;