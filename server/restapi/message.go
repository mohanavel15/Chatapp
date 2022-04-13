package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetMessages(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]

	get_dm_channel := database.DMChannel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != user.ID && get_dm_channel.ToUser != user.ID {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != user.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		user_res1 := response.NewUser(&user)
		user_res2 := response.NewUser(&get_user2)

		messages := []database.Message{}
		db.Where("channel_id = ?", get_dm_channel.Uuid).Find(&messages)

		message_res := []response.Message{}
		for _, message := range messages {
			res_message := response.Message{
				Uuid:      message.Uuid,
				Content:   message.Content,
				ChannelID: get_dm_channel.Uuid,
				CreatedAt: message.CreatedAt.Unix(),
				EditedAt:  message.UpdatedAt.Unix(),
			}

			if message.AccountID == user.ID {
				res_message.Author = user_res1
			} else if message.AccountID == get_user2.ID {
				res_message.Author = user_res2
			} else {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			message_res = append(message_res, res_message)
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
		return
	} else {
		channel := database.Channel{}
		db.Where("uuid = ?", channel_id).First(&channel)

		if channel.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var member database.Member
		db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)

		if member.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		messages := []database.Message{}
		db.Where("channel_id = ?", channel.Uuid).Find(&messages)

		messages_res := []response.Message{}
		for _, message := range messages {
			var author database.Account
			db.Where("id = ?", message.AccountID).First(&author)

			user_res := response.User{
				Uuid:      author.Uuid,
				Avatar:    author.Avatar,
				Username:  author.Username,
				CreatedAt: author.CreatedAt.Unix(),
			}

			message_res := response.Message{
				Uuid:      message.Uuid,
				Content:   message.Content,
				Author:    user_res,
				ChannelID: channel.Uuid,
				CreatedAt: message.CreatedAt.Unix(),
				EditedAt:  message.UpdatedAt.Unix(),
			}

			messages_res = append(messages_res, message_res)

		}

		res, err := json.Marshal(messages_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	}
}

func CreateMessage(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]

	var message_req request.Message
	err := json.NewDecoder(r.Body).Decode(&message_req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if message_req.Content == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	get_dm_channel := database.DMChannel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)

	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != user.ID && get_dm_channel.ToUser != user.ID {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != user.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		message := database.Message{
			Uuid:      uuid.New().String(),
			Content:   message_req.Content,
			ChannelID: get_dm_channel.Uuid,
			AccountID: user.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		db.Create(&message)

		message_res := response.Message{
			Uuid:      message.Uuid,
			Content:   message.Content,
			ChannelID: get_dm_channel.Uuid,
			Author:    response.NewUser(&user),
			CreatedAt: message.CreatedAt.Unix(),
			EditedAt:  message.UpdatedAt.Unix(),
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	} else {
		channel := database.Channel{}
		db.Where("uuid = ?", channel_id).First(&channel)

		if channel.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var member database.Member
		db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)

		if member.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		new_message := database.Message{
			Uuid:      uuid.New().String(),
			Content:   message_req.Content,
			AccountID: user.ID,
			ChannelID: channel.Uuid,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		db.Create(&new_message)

		author_res := response.User{
			Uuid:      user.Uuid,
			Avatar:    user.Avatar,
			Username:  user.Username,
			CreatedAt: user.CreatedAt.Unix(),
		}

		message_res := response.Message{
			Uuid:      new_message.Uuid,
			Content:   new_message.Content,
			Author:    author_res,
			ChannelID: channel.Uuid,
			CreatedAt: new_message.CreatedAt.Unix(),
			EditedAt:  new_message.UpdatedAt.Unix(),
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	}
}

func GetMessage(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]
	message_id := vars["mid"]

	get_dm_channel := database.DMChannel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != user.ID && get_dm_channel.ToUser != user.ID {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != user.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var message database.Message
		db.Where("uuid = ?", message_id).First(&message)
		if message.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		user_res1 := response.NewUser(&user)
		user_res2 := response.NewUser(&get_user2)

		message_res := response.Message{
			Uuid:      message.Uuid,
			Content:   message.Content,
			ChannelID: get_dm_channel.Uuid,
			CreatedAt: message.CreatedAt.Unix(),
			EditedAt:  message.UpdatedAt.Unix(),
		}

		if message.AccountID == user.ID {
			message_res.Author = user_res1
		} else if message.AccountID == get_user2.ID {
			message_res.Author = user_res2
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	} else {
		channel := database.Channel{}
		db.Where("uuid = ?", channel_id).First(&channel)

		if channel.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var member database.Member
		db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)

		if member.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		message := database.Message{}
		db.Where("uuid = ?", message_id).First(&message)

		if message.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var author database.Account
		db.Where("id = ?", message.AccountID).First(&author)

		author_res := response.User{
			Uuid:      author.Uuid,
			Avatar:    author.Avatar,
			Username:  author.Username,
			CreatedAt: author.CreatedAt.Unix(),
		}

		message_res := response.Message{
			Uuid:      message.Uuid,
			Content:   message.Content,
			Author:    author_res,
			ChannelID: channel.Uuid,
			CreatedAt: message.CreatedAt.Unix(),
			EditedAt:  message.UpdatedAt.Unix(),
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	}
}

func EditMessage(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]
	message_id := vars["mid"]

	var message_req request.Message
	err := json.NewDecoder(r.Body).Decode(&message_req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if message_req.Content == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	get_dm_channel := database.DMChannel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != user.ID && get_dm_channel.ToUser != user.ID {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != user.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var message database.Message
		db.Where("uuid = ?", message_id).First(&message)
		if message.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		if message.AccountID != user.ID {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		message.Content = message_req.Content
		message.UpdatedAt = time.Now()
		db.Save(&message)

		user_res1 := response.NewUser(&user)
		user_res2 := response.NewUser(&get_user2)

		message_res := response.Message{
			Uuid:      message.Uuid,
			Content:   message.Content,
			ChannelID: get_dm_channel.Uuid,
			CreatedAt: message.CreatedAt.Unix(),
			EditedAt:  message.UpdatedAt.Unix(),
		}

		if message.AccountID == user.ID {
			message_res.Author = user_res1
		} else if message.AccountID == get_user2.ID {
			message_res.Author = user_res2
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	} else {
		channel := database.Channel{}
		db.Where("uuid = ?", channel_id).First(&channel)

		if channel.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var member database.Member
		db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)

		if member.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		message := database.Message{}
		db.Where("uuid = ?", message_id).First(&message)

		if message.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		if message.AccountID != user.ID {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		message.Content = message_req.Content
		message.UpdatedAt = time.Now()
		db.Save(&message)

		author_res := response.User{
			Uuid:      user.Uuid,
			Avatar:    user.Avatar,
			Username:  user.Username,
			CreatedAt: user.CreatedAt.Unix(),
		}

		message_res := response.Message{
			Uuid:      message.Uuid,
			Content:   message.Content,
			Author:    author_res,
			ChannelID: channel.Uuid,
			CreatedAt: message.CreatedAt.Unix(),
			EditedAt:  message.UpdatedAt.Unix(),
		}

		res, err := json.Marshal(message_res)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(res)
	}
}

func DeleteMessage(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User
	vars := mux.Vars(r)
	channel_id := vars["id"]
	message_id := vars["mid"]

	get_dm_channel := database.DMChannel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&get_dm_channel).First(&get_dm_channel)
	if get_dm_channel.ID != 0 {
		if get_dm_channel.FromUser != user.ID && get_dm_channel.ToUser != user.ID {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var get_user2 database.Account
		if get_dm_channel.FromUser != user.ID {
			ctx.Db.Where("id = ?", get_dm_channel.FromUser).First(&get_user2)
		} else {
			ctx.Db.Where("id = ?", get_dm_channel.ToUser).First(&get_user2)
		}

		if get_user2.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var message database.Message
		db.Where("uuid = ?", message_id).First(&message)
		if message.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		if message.AccountID != user.ID {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		db.Delete(&message)
	} else {
		channel := database.Channel{}
		db.Where("uuid = ?", channel_id).First(&channel)

		if channel.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var member database.Member
		db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)

		if member.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		message := database.Message{}
		db.Where("uuid = ?", message_id).First(&message)

		if message.ID == 0 {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		if message.AccountID != user.ID || channel.Owner != user.Uuid {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		db.Delete(&message)
	}
}
