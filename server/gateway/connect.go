package gateway

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"fmt"
	"log"
)

func Connect(ctx *websocket.Context) {
	data := ctx.Data

	var connect_req websocket.Connect
	err := json.Unmarshal(data, &connect_req)
	if err != nil {
		return
	}

	token := connect_req.Token
	if token == "" {
		return
	}

	get_session := database.Session{
		AccessToken: token,
	}

	ctx.Db.Where(&get_session).First(&get_session)

	if get_session.ID == 0 {
		return
	}

	get_user := database.Account{
		ID: get_session.AccountID,
	}

	ctx.Db.Where(&get_user).First(&get_user)

	if get_user.Uuid == "" {
		return
	}

	user := response.User{
		Uuid:      get_user.Uuid,
		Avatar:    get_user.Avatar,
		Username:  get_user.Username,
		CreatedAt: get_user.CreatedAt.String(),
		UpdatedAt: get_user.UpdatedAt.String(),
	}

	ctx.Ws.User = &get_user
	log.Println(fmt.Sprintf("%s joined", ctx.Ws.User.Username))

	ctx.Ws.Conns.Users[get_user.Uuid] = ctx.Ws

	var channels []database.Channel
	ctx.Db.Where("account_id = ?", get_user.ID).Find(&channels)
	for _, channel := range channels {
		ctx.Ws.Conns.Channels[channel.Uuid] = append(ctx.Ws.Conns.Channels[channel.Uuid], ctx.Ws)
	}

	ws_msg := websocket.WS_Message{
		Event: "READY",
		Data:  user,
	}

	ws_res, _ := json.Marshal(ws_msg)
	ctx.Send(ws_res)
}
