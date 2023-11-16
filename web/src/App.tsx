import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import './App.css';

import Home from "./pages/home";
import LoginContainer from "./pages/LoginContainer";
import Channel from "./pages/channel";
import Relationships from "./pages/relationships";
import Settings from "./pages/settings";
import NoPage from "./pages/nopage";
import HomeDefault from "./pages/HomeDefault";

import Login from "./components/auth/login";
import Register from "./components/auth/register";
import Chat from "./components/channel/chat";

import LoginContextProvider from "./contexts/Login";
import MessageCTX from "./contexts/messagectx";
import ContextMenuProvider from "./contexts/context_menu_ctx";
import ChannelCTX from "./contexts/channelctx";
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
						<Route index element={<HomeDefault />}/>
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