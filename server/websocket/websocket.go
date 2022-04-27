package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"Chatapp/database"
	"Chatapp/response"

	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type Ws struct {
	Uuid    string
	Conn    *websocket.Conn
	Handler *EventHandler
	Db      *gorm.DB
	User    *database.Account
	Conns   *Connections
}

func (ws *Ws) Write(data []byte) error {
	return ws.Conn.WriteMessage(websocket.TextMessage, data)
}

func (ws *Ws) Read() ([]byte, error) {
	_, data, err := ws.Conn.ReadMessage()
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (ws *Ws) ReadLoop() {
	for {
		data, err := ws.Read()
		if err != nil {
			log.Println(err)
			if ws.User != nil {
				res_user := response.NewUser(ws.User, 0)
				var member_of []database.Member
				ws.Db.Where("account_id = ?", ws.User.ID).Find(&member_of)
				for _, channel_id := range member_of {
					channel := database.Channel{
						ID: channel_id.ChannelID,
					}
					ws.Db.Where(&channel).First(&channel)
					members, ok := ws.Conns.Channels[channel.Uuid]
					if !ok {
						continue
					}

					ws_msg := WS_Message{
						Event: "STATUS_UPDATE",
						Data: response.Status{
							UserID:    res_user.Uuid,
							Status:    0,
							Type:      2,
							ChannelID: channel.Uuid,
						},
					}

					res, _ := json.Marshal(ws_msg)
					for _, conn := range members {
						conn.Write(res)
					}
					delete(members, ws.User.Uuid)
				}

				dm_channels := database.GetDMChannels(ws.User, ws.Db)
				for _, dm_channel := range dm_channels {
					status := response.Status{
						UserID:    ws.User.Uuid,
						Status:    0,
						Type:      1,
						ChannelID: dm_channel.Uuid,
					}
					BroadcastToChannel(ws.Conns, dm_channel.Uuid, "STATUS_UPDATE", status)
				}

				var friends []database.Friend
				ws.Db.Where("from_user = ?", ws.User.ID).Find(&friends)
				for _, friend := range friends {
					var friend_user database.Account
					ws.Db.Where("id = ?", friend.ToUser).First(&friend_user)
					if friend_user, ok := ws.Conns.Users[friend_user.Uuid]; ok {
						ws_message := WS_Message{
							Event: "STATUS_UPDATE",
							Data: response.Status{
								UserID: res_user.Uuid,
								Status: 0,
								Type:   0,
							},
						}
						res, _ := json.Marshal(ws_message)
						friend_user.Write(res)
					}
				}
				delete(ws.Conns.Users, ws.User.Uuid)
			}
			ws.Close()
			return
		}
		ws.HandleWSMessage(data)
	}
}

func (ws *Ws) HandleWSMessage(data []byte) {
	var ws_message WS_Message
	err := json.Unmarshal(data, &ws_message)
	if err != nil {
		fmt.Println(err)
	}

	data_json, err := json.Marshal(ws_message.Data)
	if err != nil {
		fmt.Println(err)
	}

	ctx := Context{
		Ws:    ws,
		Event: strings.ToUpper(ws_message.Event),
		Data:  data_json,
		Db:    ws.Db,
		Raw:   data,
	}

	if ws.User == nil {
		if ws_message.Event == "CONNECT" {
			ws.Handler.Handle(ctx)
		}
	} else {
		ws.Handler.Handle(ctx)
	}
}

func (ws *Ws) Close() {
	ws.Conn.Close()
}
