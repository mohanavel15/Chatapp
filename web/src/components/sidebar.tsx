import ProfileBar from './sidebar/ProfileBar';
import SideTopBar from './side_top_bar';
import ChannelList from './sidebar/ChannelList';

function SideBar() {
    return (
        <div className="flex flex-col w-60 relative bg-gray-800">
          <SideTopBar />
          <ChannelList />
          <ProfileBar />
        </div>
    );
  }
export default SideBar;