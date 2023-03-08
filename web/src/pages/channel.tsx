import { Outlet } from "react-router-dom";
import SideBar from "../components/sidebar";

export default function Channel() {
	return (
		<div className="h-screen w-full flex flex-col-reverse md:flex-row">
			<SideBar />
			<Outlet />
		</div>
	);
}