import { ChannelOBJ } from '../../models/models';
import { Link, useParams } from "react-router-dom";
import { setDefaultIcon, setDefaultAvatar } from '../../utils/errorhandle';
import { FaCircle , FaDotCircle } from "react-icons/fa"

export default function Channel({ channel }: { channel: ChannelOBJ }) {
  const parameter = useParams<string>();
  let channel_id = parameter.id || "@me";

  return (
    <Link to={`/channels/${channel.id}`} className="no-underline" >
      <div className={`h-12 mx-2 my-1 rounded-lg flex items-center ${channel_id === channel.id && "bg-gray-700"} justify-start hover:bg-gray-700 group`}>
          <div className="relative flex items-center justify-center mx-2">
            <img className='h-10 w-10 rounded-full' src={channel.type === 1 ? channel.recipients[0].avatar : channel.icon} alt="Icon" onError={channel.type === 1 ? setDefaultAvatar : setDefaultIcon} />
            { channel.type === 1 && 
              <>
              { channel.recipients[0].status === 1 ? 
                <FaCircle className={`text-lg text-green-600 rounded-full p-1 absolute bottom-0 right-0 ${channel_id === channel.id ? "bg-gray-700" : "bg-gray-800"} group-hover:bg-gray-700`} /> : 
                <FaDotCircle className={`text-lg text-gray-500 rounded-full p-1 absolute bottom-0 right-0 ${channel_id === channel.id ? "bg-gray-700" : "bg-gray-800"} group-hover:bg-gray-700`} /> 
              }
              </>
            }
          </div>
          <span className='w-32 text-gray-300 text-lg text-left overflow-hidden whitespace-nowrap text-ellipsis'>{channel.type === 1 ? channel.recipients[0].username : channel.name }</span>
      </div>
    </Link>
  )
}
