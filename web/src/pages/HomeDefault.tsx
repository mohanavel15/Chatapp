import { Link } from "react-router-dom";

export default function HomeDefault() {
    return <div className="flex w-full h-full items-center justify-center">
        <div className="flex flex-col w-96 items-center">
            <span className="font-semibold">Home</span>
            <span>Chatapp is an open-source application crafted with a ReactJS frontend and a Golang backend, 
                showcasing a robust combination of cutting-edge technologies.
                <br />
                <br />Source code: <Link className="text-cyan-400" to="https://github.com/mohanavel15/Chatapp">github.com/mohanavel15/Chatapp</Link>
                <br />Licence: <Link className="text-cyan-400" to="https://github.com/mohanavel15/Chatapp/blob/main/LICENSE">MIT</Link>
            </span>
        </div>
    </div>
}