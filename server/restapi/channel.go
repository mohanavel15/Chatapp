package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func CreateChannel(ctx *Context) {
	var request request.Channel
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)

	if request.Name == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	channel := database.CreateChannel(request.Name, request.Icon, &ctx.User, ctx.Db)
	response := response.NewChannel(channel)

	res, err := json.Marshal(response)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)

	if ws, ok := ctx.Conn.Users[ctx.User.Uuid]; ok {
		ws_msg := websocket.WS_Message{
			Event: "CHANNEL_CREATE",
			Data:  response,
		}
		ws_res, _ := json.Marshal(ws_msg)
		ws.Write(ws_res)
	}
}

func GetChannels(ctx *Context) {
	res_channels := response.Channels{}
	channels := database.GetChannels(&ctx.User, ctx.Db)
	for _, channel := range channels {
		res_channels = append(res_channels, response.NewChannel(&channel))
	}

	res, err := json.Marshal(res_channels)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func GetChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel, statusCode := database.GetChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	res_channel := response.NewChannel(channel)
	res, err := json.Marshal(res_channel)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func EditChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	var request request.Channel
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)

	if request.Name == "" && request.Icon == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	channel, statusCode := database.ModifyChannel(channel_id, request.Name, request.Icon, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	res_channel := response.NewChannel(channel)

	res, err := json.Marshal(res_channel)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}
	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)

	websocket.BroadcastToChannel(ctx.Conn, res_channel.Uuid, "CHANNEL_MODIFY", res_channel)
}

func DeleteChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel, member, statusCode := database.DeleteChannel(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	res_channel := response.NewChannel(channel)
	res, err := json.Marshal(res_channel)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)

	if ws, ok := ctx.Conn.Channels[channel_id][ctx.User.Uuid]; ok {
		ws_message := websocket.WS_Message{
			Event: "CHANNEL_DELETE",
			Data:  res_channel,
		}
		ws_res, _ := json.Marshal(ws_message)
		ws.Write(ws_res)
		delete(ctx.Conn.Channels[channel_id], ctx.User.Uuid)
	}

	res_member_user := response.NewUser(&ctx.User, 0)
	res_member := response.NewMember(&res_member_user, channel, member)
	websocket.BroadcastToChannel(ctx.Conn, channel.Uuid, "MEMBER_REMOVE", res_member)
}
