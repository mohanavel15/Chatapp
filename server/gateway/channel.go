package gateway

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

func ChannelCreate(ctx *websocket.Context) {
	var request request.Channel
	err := json.Unmarshal(ctx.Data, &request)

	if err != nil {
		return
	}

	if request.Name == "" {
		return
	}

	channel := database.Channel{
		Uuid:           uuid.New().String(),
		Name:           request.Name,
		Icon:           request.Icon,
		Owner:          ctx.Ws.User.Uuid,
		PrivateChannel: false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	ctx.Db.Create(&channel)

	members := database.Member{
		ChannelID: channel.ID,
		AccountID: ctx.Ws.User.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	ctx.Db.Create(&members)

	response := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        ctx.Ws.User.Uuid,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	ws_msg := websocket.WS_Message{
		Event: "CHANNEL_CREATE",
		Data:  response,
	}

	res, _ := json.Marshal(ws_msg)
	ctx.Send(res)
}

func ChannelModify(ctx *websocket.Context) {}
func ChannelDelete(ctx *websocket.Context) {}

func ChannelJoin(ctx *websocket.Context)   {}
func ChannelRemove(ctx *websocket.Context) {}
