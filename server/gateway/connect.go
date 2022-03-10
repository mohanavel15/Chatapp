package gateway

import (
	"Chatapp/database"
	"Chatapp/websocket"
	"encoding/json"
	"fmt"
	"log"
)

func ConnectUser(ctx *websocket.Context) {
	data := ctx.Data

	var connect websocket.Connect
	err := json.Unmarshal(data, &connect)
	if err != nil {
		return
	}

	token := connect.Token
	if token == "" {
		return
	}

	get_session := database.Session{
		AccessToken: token,
	}
	ctx.Db.Where(&get_session).First(&get_session)

	if get_session.Uuid == "" {
		return
	}

	get_user := database.Account{
		ID: get_session.AccountID,
	}
	ctx.Db.Where(&get_user).First(&get_user)

	if get_user.Uuid == "" {
		return
	}

	user := websocket.User{
		Uuid:     get_user.Uuid,
		Avatar:   get_user.Avatar,
		Username: get_user.Username,
	}

	ctx.Ws.User = &user
	log.Println(fmt.Sprintf("%s joined", ctx.Ws.User.Username))

	// user_obj_string, _ := json.Marshal(user)

	ws_res := websocket.WS_Message{
		Event: "READY",
		Data:  user,
	}

	ws_res_string, _ := json.Marshal(ws_res)

	ctx.Send([]byte(ws_res_string))
}
