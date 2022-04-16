package gateway

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/restapi"
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

	is_valid := restapi.ValidateAccessToken(token, ctx.Db)
	if is_valid != true {
		ws_message := websocket.WS_Message{
			Event: "INVAILD_SESSION",
		}
		res, _ := json.Marshal(ws_message)
		ctx.Ws.Write(res)
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

	res_user := response.User{
		Uuid:      get_user.Uuid,
		Avatar:    get_user.Avatar,
		Username:  get_user.Username,
		Status:    1,
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

	channels := []database.Channel{}
	res_channels := []response.Channel{}

	var member_of []database.Member
	ctx.Db.Where("account_id = ?", get_user.ID).Find(&member_of)
	for _, channel_id := range member_of {
		channel := database.Channel{
			ID: channel_id.ChannelID,
		}
		ctx.Db.Where(&channel).First(&channel)

		channels = append(channels, channel)
		res_channels = append(res_channels, response.NewChannel(&channel))

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

	var dm_channels1 []database.DMChannel
	var dm_channels2 []database.DMChannel
	ctx.Db.Where("from_user = ?", get_user.ID).Find(&dm_channels1)
	ctx.Db.Where("to_user = ?", get_user.ID).Find(&dm_channels2)

	var res_dm_channels []response.DMChannel
	for _, dm_channel := range dm_channels1 {
		var user database.Account
		ctx.Db.Where("id = ?", dm_channel.ToUser).First(&user)

		var status int
		isConnected := ctx.Ws.Conns.Users[user.Uuid]
		if isConnected == nil {
			status = 0
		} else {
			status = 1
		}

		res_user2 := response.NewUser(&user, status)
		res_dm_channels = append(res_dm_channels, response.DMChannel{
			Uuid:      dm_channel.Uuid,
			Recipient: res_user2,
		})
		if isConnected != nil {
			res_dm_update := websocket.WS_Message{
				Event: "DM_CHANNEL_MODIFY",
				Data: response.DMChannel{
					Uuid:      dm_channel.Uuid,
					Recipient: res_user,
				},
			}

			res_dm_update_json, err := json.Marshal(res_dm_update)
			if err == nil {
				isConnected.Write(res_dm_update_json)
			}
		}
	}

	for _, dm_channel := range dm_channels2 {
		var user database.Account
		ctx.Db.Where("id = ?", dm_channel.FromUser).First(&user)
		var status int
		isConnected := ctx.Ws.Conns.Users[user.Uuid]
		if isConnected == nil {
			status = 0
		} else {
			status = 1
		}
		res_user2 := response.NewUser(&user, status)
		res_dm_channels = append(res_dm_channels, response.DMChannel{
			Uuid:      dm_channel.Uuid,
			Recipient: res_user2,
		})

		if isConnected != nil {
			res_dm_update := websocket.WS_Message{
				Event: "DM_CHANNEL_MODIFY",
				Data: response.DMChannel{
					Uuid:      dm_channel.Uuid,
					Recipient: res_user,
				},
			}

			res_dm_update_json, err := json.Marshal(res_dm_update)
			if err == nil {
				isConnected.Write(res_dm_update_json)
			}
		}
	}

	var friendsDB []database.Friend
	ctx.Db.Where("from_user = ?", get_user.ID).Find(&friendsDB)

	var friendsDBIncoming []database.Friend
	ctx.Db.Where("to_user = ?", get_user.ID).Find(&friendsDBIncoming)

	res_friends := []response.Friend{}

	for _, friend := range friendsDB {
		friend_user := database.Account{
			ID: friend.ToUser,
		}
		ctx.Db.Where(&friend_user).First(&friend_user)

		if friend_user.ID == 0 {
			continue
		}

		_, ok := ctx.Ws.Conns.Users[friend_user.Uuid]
		status := 0
		if ok {
			status = 1
		}

		res_friend := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				Status:    status,
				CreatedAt: friend_user.CreatedAt.Unix(),
			},
			Pending:  false,
			Incoming: false,
		}

		friend_check := database.Friend{
			FromUser: friend_user.ID,
			ToUser:   get_user.ID,
		}
		ctx.Db.Where(&friend_check).First(&friend_check)
		if friend_check.ID == 0 {
			res_friend.Pending = true
		}

		res_friends = append(res_friends, res_friend)
	}

	for _, friend := range friendsDBIncoming {
		friend_user := database.Account{
			ID: friend.FromUser,
		}
		ctx.Db.Where(&friend_user).First(&friend_user)

		if friend_user.ID == 0 {
			continue
		}
		res_friend := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				CreatedAt: friend_user.CreatedAt.Unix(),
			},
			Incoming: true,
		}

		friend_check := database.Friend{
			FromUser: get_user.ID,
			ToUser:   friend_user.ID,
		}
		ctx.Db.Where(&friend_check).First(&friend_check)
		if friend_check.ID != 0 {
			continue
		}
		res_friend.Pending = true
		res_friends = append(res_friends, res_friend)
	}

	ws_msg := websocket.WS_Message{
		Event: "READY",
		Data: websocket.Ready{
			User:       res_user,
			DMChannels: res_dm_channels,
			Channels:   res_channels,
			Friends:    res_friends,
		},
	}

	ws_res, _ := json.Marshal(ws_msg)
	ctx.Send(ws_res)
}
