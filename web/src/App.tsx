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

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;
