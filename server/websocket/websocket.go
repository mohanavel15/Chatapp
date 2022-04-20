package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

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
				member := response.Member{
					Uuid:      ws.User.Uuid,
					Avatar:    ws.User.Avatar,
					Username:  ws.User.Username,
					Status:    0,
					CreatedAt: ws.User.CreatedAt.String(),
				}
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

					member.ChannelID = channel.Uuid
					member.Is_Owner = channel.Owner == ws.User.Uuid
					member.JoinedAt = channel_id.CreatedAt.String()

					ws_msg := WS_Message{
						Event: "MEMBER_UPDATE",
						Data:  member,
					}

					res_member, err := json.Marshal(ws_msg)
					if err != nil {
						return
					}

					for _, member := range members {
						member.Write(res_member)
					}

					delete(members, ws.User.Uuid)
				}

				res_user := response.NewUser(ws.User, 0)
				var dm_channels1 []database.DMChannel
				var dm_channels2 []database.DMChannel
				ws.Db.Where("from_user = ?", ws.User.ID).Find(&dm_channels1)
				ws.Db.Where("to_user = ?", ws.User.ID).Find(&dm_channels2)

				var res_dm_channels []response.DMChannel
				for _, dm_channel := range dm_channels1 {
					var user database.Account
					ws.Db.Where("id = ?", dm_channel.ToUser).First(&user)

					var status int
					isConnected := ws.Conns.Users[user.Uuid]
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
						res_dm_update := WS_Message{
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
					ws.Db.Where("id = ?", dm_channel.FromUser).First(&user)
					var status int
					isConnected := ws.Conns.Users[user.Uuid]
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
						res_dm_update := WS_Message{
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
				delete(ws.Conns.Users, ws.User.Uuid)
			}
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

func (ws *Ws) HandleQueue() {
	for {
		if len(ws.Conns.Queue) > 0 {
			for _, ws_message := range ws.Conns.Queue {
				switch ws_message.Event {
				case "MESSAGE_CREATE":
					BroadcastMessage(ws, *ws_message)
				case "MESSAGE_MODIFY":
					BroadcastMessage(ws, *ws_message)
				case "MESSAGE_DELETE":
					BroadcastMessage(ws, *ws_message)
				}
				ws.Conns.Queue = ws.Conns.Queue[1:]
			}
		}
		time.Sleep(time.Millisecond)
	}
}

func (ws *Ws) Close() {
	ws.Conn.Close()
}
