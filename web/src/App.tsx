import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import Channel from "./pages/channel";
import Login from "./pages/login";
import Home from "./pages/home";
import NoPage from "./pages/nopage";
import Register from "./pages/register";
import { States } from "./contexts/states";
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
import ChannelCTX from "./contexts/channelctx";
import UserCTX from "./contexts/usercontext";
import { CtxMenuCtx } from "./contexts/context_menu_ctx";
import Routes from "./config";

const gateway = new WebSocket(Routes.ws);
function App() {
  	return (
		<div className="App">
			<ChannelCTX gateway={gateway}>
				<BrowserRouter>
					<RouterRoutes>
						<Route path="/">
							<Route index element={<Home />} />
							<Route path="channels/:id" element={
								<States>
									<CtxMenuCtx>
										<UserCTX>
											<Channel />
										</UserCTX>
									</CtxMenuCtx>
								</States>
							} />
							<Route path="login" element={<Login />} />
							<Route path="register" element={<Register />} />
							<Route path="*" element={<NoPage />} />
						</Route>
					</RouterRoutes>
				</BrowserRouter>
			</ChannelCTX>
		</div>
  	);
}

export default App;
