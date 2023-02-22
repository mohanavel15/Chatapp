import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faDownload } from '@fortawesome/free-solid-svg-icons'
import { MessageOBJ } from '../../../models/models';

export default function AttachmentDefault({ message }: { message: MessageOBJ }) {
    return (
        <div className="attachment">
            <div className="attachment-icon">
                <FontAwesomeIcon icon={faFile} />
            </div>
            <div className="attachment-name">
                <p className="attachment-filename">
                    <a href={message.attachments[0].url} rel="noreferrer" target="_blank">
                        {message.attachments[0].filename}
                    </a>
                </p>
                <p className="attachment-size">{message.attachments[0].size} bytes</p>
            </div>
            <button className="attachment-download">
                <a href={message.attachments[0].url} rel="noreferrer" target="_blank">
                    <FontAwesomeIcon icon={faDownload} />
                </a>
            </button>
        </div>
    )
}
