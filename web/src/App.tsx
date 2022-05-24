import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import Channel from "./pages/channel";
import Login from "./pages/login";
import Home from "./pages/home";
import NoPage from "./pages/nopage";
import Register from "./pages/register";

import './App.css';
import './css/chat.css';
import './css/login.css';
import './css/message.css';
import './css/sidebar.css';
import './css/members_bar.css';
import './css/channel.css';
import './css/contextmenu.css';
import './css/friends.css';
import './css/profile.css';
import './css/settings.css';

import States from "./contexts/states";
import ChannelCTX from "./contexts/channelctx";
import UserCTX from "./contexts/usercontext";
import CtxMenuCtx from "./contexts/context_menu_ctx";

function App() {
  	return (
		<div className="App">
			<BrowserRouter>
				<RouterRoutes>
					<Route path="/">
						<Route index element={<Home />} />
						<Route path="channels/:id" element={
							<ChannelCTX>
								<States>
								<CtxMenuCtx>
									<UserCTX>
										<Channel />
									</UserCTX>
								</CtxMenuCtx>
								</States>
							</ChannelCTX>
						} />
						<Route path="login" element={<Login />} />
						<Route path="register" element={<Register />} />
						<Route path="*" element={<NoPage />} />
					</Route>
				</RouterRoutes>
			</BrowserRouter>
		</div>
  	);
}

export default App;
