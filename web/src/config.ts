class RoutesCls {
    protocol = window.location.protocol;
    ip = window.location.host;
    host = this.protocol + '//' + this.ip + '/api';
    ws = (window.location.protocol === "https:" ? "wss:" : "ws:") + '//' + this.ip + '/api/ws';

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
