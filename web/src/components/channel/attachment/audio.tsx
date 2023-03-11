import { MessageOBJ } from '../../../models/models';

export default function AttachmentAudio({ message }: { message: MessageOBJ }) {
  return (
    <audio controls>
      <source src={message.attachments[0].url} type={message.attachments[0].content_type} />
    </audio>
  )
}