import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/usercontext";

function Home() {
  const user_ctx = useContext(UserContext)
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user_ctx.isLoggedIn) {
      navigate("/login");
    }
  }, [user_ctx.isLoggedIn])

  return (
    <div>
      <h1> Hello, {user_ctx.username} </h1>
    </div>
  );
}

export default Home;