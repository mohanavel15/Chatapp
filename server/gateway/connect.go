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
		CreatedAt: get_user.CreatedAt.Unix(),
	}

	member := response.Member{
		Uuid:      get_user.Uuid,
		Avatar:    get_user.Avatar,
		Username:  get_user.Username,
		Status:    1,
		CreatedAt: get_user.CreatedAt.String(),
	}

	ctx.Ws.User = &get_user
	log.Println(fmt.Sprintf("%s joined", ctx.Ws.User.Username))

	ctx.Ws.Conns.Users[get_user.Uuid] = ctx.Ws

	var member_of []database.Member
	ctx.Db.Where("account_id = ?", get_user.ID).Find(&member_of)
	for _, channel_id := range member_of {
		channel := database.Channel{
			ID: channel_id.ChannelID,
		}
		ctx.Db.Where(&channel).First(&channel)

		_, ok := ctx.Ws.Conns.Channels[channel.Uuid]
		if !ok {
			ctx.Ws.Conns.Channels[channel.Uuid] = make(map[string]*websocket.Ws)
		}
		ctx.Ws.Conns.Channels[channel.Uuid][get_user.Uuid] = ctx.Ws

		member.ChannelID = channel.Uuid
		member.Is_Owner = channel.Owner == get_user.Uuid
		member.JoinedAt = channel_id.CreatedAt.String()

		ws_msg := websocket.WS_Message{
			Event: "MEMBER_UPDATE",
			Data:  member,
		}

		res_member, err := json.Marshal(ws_msg)
		if err != nil {
			return
		}

		if members, ok := ctx.Ws.Conns.Channels[channel.Uuid]; ok {
			for _, member := range members {
				member.Write(res_member)
			}
		}
	}

	ws_msg := websocket.WS_Message{
		Event: "READY",
		Data:  user,
	}

	ws_res, _ := json.Marshal(ws_msg)
	ctx.Send(ws_res)
}
