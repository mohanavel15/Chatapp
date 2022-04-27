package gateway

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/restapi"
	"Chatapp/websocket"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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

	is_valid, session := restapi.ValidateAccessToken(token, ctx.Db)
	if is_valid != true {
		ws_message := websocket.WS_Message{
			Event: "INVAILD_SESSION",
		}
		res, _ := json.Marshal(ws_message)
		ctx.Ws.Write(res)
		return
	}

	get_user, statusCode := database.GetUser(session.Uuid, ctx.Db)
	if statusCode != http.StatusOK {
		return
	}

	res_user := response.NewUser(get_user, 1)

	ctx.Ws.User = get_user
	log.Println(fmt.Sprintf("%s joined", ctx.Ws.User.Username))
	ctx.Ws.Conns.Users[get_user.Uuid] = ctx.Ws

	res_channels := []response.Channel{}

	var member_of []database.Member
	ctx.Db.Where("account_id = ?", get_user.ID).Find(&member_of)
	for _, channel_id := range member_of {
		channel := database.Channel{
			ID: channel_id.ChannelID,
		}
		ctx.Db.Where(&channel).First(&channel)
		res_channels = append(res_channels, response.NewChannel(&channel))
		_, ok := ctx.Ws.Conns.Channels[channel.Uuid]
		if !ok {
			ctx.Ws.Conns.Channels[channel.Uuid] = make(map[string]*websocket.Ws)
		}
		ctx.Ws.Conns.Channels[channel.Uuid][get_user.Uuid] = ctx.Ws

		status := response.Status{
			UserID:    get_user.Uuid,
			Status:    1,
			Type:      2,
			ChannelID: channel.Uuid,
		}
		websocket.BroadcastToChannel(ctx.Ws.Conns, channel.Uuid, "STATUS_UPDATE", status)
	}

	dm_channels := database.GetDMChannels(ctx.Ws.User, ctx.Db)
	res_dm_channels := []response.DMChannel{}

	for _, dm_channel := range dm_channels {
		var dm_user database.Account
		if dm_channel.FromUser != ctx.Ws.User.ID {
			ctx.Db.Where("id = ?", dm_channel.FromUser).First(&dm_user)
		} else {
			ctx.Db.Where("id = ?", dm_channel.ToUser).First(&dm_user)
		}

		status := 0
		if dm_user, ok := ctx.Ws.Conns.Users[dm_user.Uuid]; ok {
			status = 1

			res_status_update := websocket.WS_Message{
				Event: "STATUS_UPDATE",
				Data: response.Status{
					UserID:    res_user.Uuid,
					Status:    1,
					Type:      1,
					ChannelID: dm_channel.Uuid,
				},
			}

			res_dm_update_json, err := json.Marshal(res_status_update)
			if err == nil {
				dm_user.Write(res_dm_update_json)
			}
		}

		res_user := response.NewUser(&dm_user, status)
		res_dm_channels = append(res_dm_channels, response.DMChannel{
			Uuid:      dm_channel.Uuid,
			Recipient: res_user,
		})

		_, ok := ctx.Ws.Conns.Channels[dm_channel.Uuid]
		if !ok {
			ctx.Ws.Conns.Channels[dm_channel.Uuid] = make(map[string]*websocket.Ws)
		}
		ctx.Ws.Conns.Channels[dm_channel.Uuid][get_user.Uuid] = ctx.Ws
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

		friend_user_ws, ok := ctx.Ws.Conns.Users[friend_user.Uuid]
		status := 0
		if ok {
			status = 1
			res_status_update := websocket.WS_Message{
				Event: "STATUS_UPDATE",
				Data: response.Status{
					UserID: res_user.Uuid,
					Status: 1,
					Type:   0,
				},
			}

			res_dm_update_json, err := json.Marshal(res_status_update)
			if err == nil {
				friend_user_ws.Write(res_dm_update_json)
			}
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
