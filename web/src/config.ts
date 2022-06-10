class RoutesCls {
    ip = '127.0.0.1:5000';
    host = 'http://' + this.ip;
    ws = 'ws://' + this.ip + '/ws';

    signin = this.host + '/login';
    signup = this.host + '/register';
    logout = this.host + '/logout';
    refresh = this.host + '/refresh';
    signout = this.host + '/signout';
    changePassword = this.host + '/changepassword';

    users = this.host + '/users';
    currentUser = this.users +'/@me';
    Relationships = this.currentUser + '/relationships';

    Invites = this.host + '/invites';
    Channels = this.host + '/channels';
}


const Routes = new RoutesCls()
export default Routes;
