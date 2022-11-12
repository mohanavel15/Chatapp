import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

function Home() {
  return (
    <div className="h-screen w-full flex flex-col-reverse md:flex-row">
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Home;