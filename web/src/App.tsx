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

import ChannelCTX from "./contexts/channelctx";
import ContextMenuProvider from "./contexts/context_menu_ctx";
import LoginContainer from "./pages/LoginContainer";
import LoginContextProvider from "./contexts/Login";
import Chat from "./components/channel/chat";
import MessageCTX from "./contexts/messagectx";
import Relationships from "./components/relationships";
import Settings from "./pages/settings";
import UserCTX from "./contexts/usercontext";
import PopUpProvider from "./contexts/popup";

function App() {
  	return (
		<div className="h-screen w-full bg-black text-white">
			<BrowserRouter>
				<UserCTX>
				<RouterRoutes>
					<Route path="/" element={
						<ChannelCTX>
							<PopUpProvider>
								<ContextMenuProvider>
									<Home />
								</ContextMenuProvider>
							</PopUpProvider>
						</ChannelCTX>
					}>
						<Route path="channels" element={<Channel />}>
							<Route path=":id" element={ 
								<MessageCTX>
									<Chat />
								</MessageCTX>
							 } />
						</Route>
						<Route path="relationships" element={ <Relationships /> } />
						<Route path="settings" element={ <Settings /> } />
					</Route>
					<Route path="auth" element={
						<LoginContextProvider>
							<LoginContainer />
						</LoginContextProvider>
					}>
						<Route path="login" element={ <Login /> } />
						<Route path="register" element={ <Register /> } />
					</Route>
					<Route path="*" element={<NoPage />} />
				</RouterRoutes>
				</UserCTX>
			</BrowserRouter>
		</div>
  	);
}

export default App;