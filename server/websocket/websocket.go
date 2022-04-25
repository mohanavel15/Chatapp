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
					member := response.NewMember(&res_user, &channel, &channel_id)

					ws_msg := WS_Message{
						Event: "MEMBER_UPDATE",
						Data:  member,
					}

					res, _ := json.Marshal(ws_msg)
					for _, conn := range members {
						conn.Write(res)
					}
					delete(members, ws.User.Uuid)
				}

				dm_channels := database.GetDMChannels(ws.User, ws.Db)
				for _, dm_channel := range dm_channels {
					var dm_user database.Account
					if dm_channel.FromUser != ws.User.ID {
						ws.Db.Where("id = ?", dm_channel.FromUser).First(&dm_user)
					} else {
						ws.Db.Where("id = ?", dm_channel.ToUser).First(&dm_user)
					}

					if dm_user, ok := ws.Conns.Users[dm_user.Uuid]; ok {
						dm_update := WS_Message{
							Event: "DM_CHANNEL_MODIFY",
							Data: response.DMChannel{
								Uuid:      dm_channel.Uuid,
								Recipient: res_user,
							},
						}

						res_dm_update, _ := json.Marshal(dm_update)
						dm_user.Write(res_dm_update)
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
