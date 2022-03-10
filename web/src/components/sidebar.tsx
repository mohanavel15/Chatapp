import ProfileBar from './profile_bar';
import SideTopBar from './side_top_bar';
import ChannelBar from './channel_bar';

function SideBar() {
    return (
        <div className="Sidebar">
          <SideTopBar />
          <ChannelBar />
          <ProfileBar />
        </div>
    );
  }
export default SideBar;