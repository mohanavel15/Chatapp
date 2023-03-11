import { MessageOBJ } from '../../../models/models';

export default function AttachmentVideo({ message }: { message: MessageOBJ }) {
  return (
    <video controls width={"32%"}>
      <source src={message.attachments[0].url} type={message.attachments[0].content_type} />
    </video>
  )
}