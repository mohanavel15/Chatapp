import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ChannelCTX from "./contexts/channelctx";

const gateway = new W3CWebSocket('ws://127.0.0.1:5000/ws');
function App() {
  	return (
		<div className="App">
			<ChannelCTX gateway={gateway}>
				<BrowserRouter>
					<Routes>
						<Route path="/">
							<Route index element={<Home />} />
							<Route path="channels/:id" element={<States><Channel /></States>} />
							<Route path="login" element={<Login />} />
							<Route path="register" element={<Register />} />
							<Route path="*" element={<NoPage />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</ChannelCTX>
		</div>
  	);
}

export default App;
