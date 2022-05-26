package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"

	"github.com/google/uuid"
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
	content_type := ctx.Req.Header.Get("Content-Type")
	if content_type == "application/json" {
		return
	} else {
		name := ctx.Req.FormValue("name")
		file, handler, err := ctx.Req.FormFile("file")
		if err != nil {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}
		defer file.Close()

		file_type_regx := regexp.MustCompile("image/.+")
		file_type := file_type_regx.FindString(handler.Header["Content-Type"][0])
		if file_type == "" {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		ext_regx := regexp.MustCompile("\\.[\\w]+$")
		ext := ext_regx.FindString(handler.Filename)

		new_file_id := uuid.New().String()
		new_file_name := fmt.Sprintf("%s%s", new_file_id, ext)
		upload_folder := fmt.Sprintf("files/icons/%s/", channel_id)

		_, err = os.Stat(upload_folder)
		if os.IsNotExist(err) {
			err := os.MkdirAll(upload_folder, 0750)
			if err != nil {
				ctx.Res.WriteHeader(http.StatusInternalServerError)
				return
			}
		}

		new_file_name_with_path := fmt.Sprintf("%s%s", upload_folder, new_file_name)
		new_file, err := os.OpenFile(new_file_name_with_path, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer new_file.Close()
		io.Copy(new_file, file)

		url := fmt.Sprintf("http://127.0.0.1:5000/icons/%s/%s", channel_id, new_file_name)

		channel, statusCode := database.ModifyChannel(channel_id, name, url, &ctx.User, ctx.Db)
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
