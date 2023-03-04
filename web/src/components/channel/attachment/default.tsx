import { MessageOBJ } from '../../../models/models';
import { FaDownload, FaFile } from "react-icons/fa";

export default function AttachmentDefault({ message }: { message: MessageOBJ }) {
    return (
        <div className="relative h-16 w-4/5 flex bg-zinc-800 rounded-lg items-center mb-4 p-4">
            <FaFile size={32} />
            <div className="flex flex-col px-4">
                <p className="m-0 text-cyan-400 hover:underline">
                    <a href={message.attachments[0].url} rel="noreferrer" target="_blank">
                        {message.attachments[0].filename}
                    </a>
                </p>
                <p className="m-0 text-xs">{message.attachments[0].size} bytes</p>
            </div>
            <button className="absolute right-4 text-zinc-500 hover:text-zinc-400">
                <a href={message.attachments[0].url} rel="noreferrer" target="_blank">
                    <FaDownload className="" size={32} />
                </a>
            </button>
        </div>
    )
}
