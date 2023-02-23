import { Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import SideBar from "../components/sidebar";
import { ContextMenu } from "../contexts/context_menu_ctx";

export default function Channel() {
	const ctx_menu = useContext(ContextMenu);

	useEffect(() => {
		const handleClick = () => { 
			ctx_menu.closeAll();
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, []);

	return (
		<div className="h-screen w-full flex flex-col-reverse md:flex-row">
			<SideBar />
			<Outlet />
		</div>
	);
}