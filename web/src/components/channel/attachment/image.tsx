import { MessageOBJ } from '../../../models/models';

export default function AttachmentImage({ message }: { message: MessageOBJ }) {
  return (
    <div>
      <img width={"32%"} src={message.attachments[0].url} alt={message.attachments[0].filename} />
    </div>
  )
}
