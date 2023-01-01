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
import CtxMenuCtx from "./contexts/context_menu_ctx";
import LoginContainer from "./pages/LoginContainer";
import LoginContextProvider from "./contexts/Login";
import Chat from "./components/channel/chat";
import MessageCTX from "./contexts/messagectx";
import Relationships from "./components/relationships";

function App() {
  	return (
		<div className="h-screen w-full bg-black text-white">
			<BrowserRouter>
				<RouterRoutes>
					<Route path="/" element={
						<ChannelCTX>
							<Home />
						</ChannelCTX>
					}>
						<Route path="channels" element={
								<States>
									<CtxMenuCtx>
										<Channel />
									</CtxMenuCtx>
								</States>
							}>
							<Route path=":id" element={ 
								<MessageCTX>
									<Chat />
								</MessageCTX>
							 } />
						</Route>
						<Route path="relationships" element={ <Relationships /> } />
					</Route>
					<Route path="/auth" element={
						<LoginContextProvider>
							<LoginContainer />
						</LoginContextProvider>
					}>
						<Route path="login" element={ <Login /> } />
						<Route path="register" element={ <Register /> } />
					</Route>
					<Route path="*" element={<NoPage />} />
				</RouterRoutes>
			</BrowserRouter>
		</div>
  	);
}

export default App;