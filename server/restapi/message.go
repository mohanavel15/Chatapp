package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func GetMessages(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	messages, statusCode := database.GetMessages(channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	messages_res := []response.Message{}
	for _, message := range messages {
		user, statusCode := database.GetUser(message.AccountID.Hex(), ctx.Db)
		if statusCode != http.StatusOK {
			continue
		}
		messages_res = append(messages_res, response.NewMessage(&message, response.NewUser(user, 0)))
	}

	res, err := json.Marshal(messages_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func GetMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	message, _, statusCode := database.GetMessage(message_id, channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	user, statusCode := database.GetUser(message.AccountID.Hex(), ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(user, 0))

	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func CreateMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]

	content_type := ctx.Req.Header.Get("Content-Type")
	if content_type == "application/json" {
		var message_req request.Message
		err := json.NewDecoder(ctx.Req.Body).Decode(&message_req)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		content := strings.TrimSpace(message_req.Content)

		if content == "" {
			ctx.Res.WriteHeader(http.StatusBadRequest)
			return
		}

		message, statusCode := database.CreateMessage(content, channel_id, &ctx.User, ctx.Db)
		if statusCode != http.StatusOK {
			ctx.Res.WriteHeader(statusCode)
			return
		}

		message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))
		res, err := json.Marshal(message_res)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}

		ctx.Res.Header().Set("Content-Type", "application/json")
		ctx.Res.Write(res)

		ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_CREATE", message_res)
	} else {
		/*
			content := ctx.Req.FormValue("content")
			file, handler, err := ctx.Req.FormFile("file")
			if err != nil {
				ctx.Res.WriteHeader(http.StatusBadRequest)
				return
			}
			defer file.Close()

			ext_regx := regexp.MustCompile("\\.[\\w]+$")
			ext := ext_regx.FindString(handler.Filename)

			new_file_id := uuid.New().String()
			new_file_name := fmt.Sprintf("%s%s", new_file_id, ext)
			upload_folder := fmt.Sprintf("files/attachments/%s/%s/", channel_id, ctx.User.Uuid)

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

			url := fmt.Sprintf("http://127.0.0.1:5000/attachments/%s/%s/%s", channel_id, ctx.User.Uuid, new_file_name)

			attachment := response.Attachment{
				Uuid:        new_file_id,
				Name:        handler.Filename,
				Size:        handler.Size,
				ContentType: handler.Header["Content-Type"][0],
				Url:         url,
			}
			attachments := []response.Attachment{attachment}

			message_res := response.Message{
				ID:        uuid.New().String(),
				Content:     content,
				Author:      response.NewUser(&ctx.User, 0),
				ChannelID:   channel_id,
				CreatedAt:   time.Now().Unix(),
				EditedAt:    time.Now().Unix(),
				Attachments: attachments,
			}
			ctx.Conn.BroadcastToChannel(channel_id, "MESSAGE_CREATE", message_res)
		*/
	}
}

func EditMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	var message_req request.Message
	err := json.NewDecoder(ctx.Req.Body).Decode(&message_req)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	content := strings.TrimSpace(message_req.Content)

	if content == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	message, statusCode := database.EditMessage(message_id, channel_id, content, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(&ctx.User, 0))
	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
	ctx.Conn.BroadcastToChannel(message_res.ChannelID, "MESSAGE_MODIFY", message_res)
}

func DeleteMessage(ctx *Context) {
	vars := mux.Vars(ctx.Req)
	channel_id := vars["id"]
	message_id := vars["mid"]

	message, statusCode := database.DeleteMessage(message_id, channel_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	user, statusCode := database.GetUser(message.AccountID.Hex(), ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	message_res := response.NewMessage(message, response.NewUser(user, 0))
	res, err := json.Marshal(message_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
	ctx.Conn.BroadcastToChannel(message_res.ChannelID, "MESSAGE_DELETE", message_res)
}
