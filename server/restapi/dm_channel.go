package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetDMChannels(ctx *Context) {
	var dm_channels1 []database.DMChannel
	var dm_channels2 []database.DMChannel
	ctx.Db.Where("from_user = ?", ctx.User.ID).Find(&dm_channels1)
	ctx.Db.Where("to_user = ?", ctx.User.ID).Find(&dm_channels2)

	var res []response.DMChannel
	for _, dm_channel := range dm_channels1 {
		var user database.Account
		ctx.Db.Where("id = ?", dm_channel.ToUser).First(&user)

		var status int
		isConnected := ctx.Conn.Users[user.Uuid]
		if isConnected == nil {
			status = 0
		} else {
			status = 1
		}
		res_user := response.NewUser(&user, status)

		res = append(res, response.DMChannel{
			Uuid:      dm_channel.Uuid,
			Recipient: res_user,
		})
	}

	for _, dm_channel := range dm_channels2 {
		var user database.Account
		ctx.Db.Where("id = ?", dm_channel.FromUser).First(&user)
		var status int
		isConnected2 := ctx.Conn.Users[user.Uuid]
		if isConnected2 == nil {
			status = 0
		} else {
			status = 1
		}
		res_user := response.NewUser(&user, status)
		res = append(res, response.DMChannel{
			Uuid:      dm_channel.Uuid,
			Recipient: res_user,
		})
	}

	res_, err := json.Marshal(res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}
	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res_)
}

func GetDMChannel(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	user_id := url_vars["id"]

	if user_id == ctx.User.Uuid {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	var dm_user database.Account
	ctx.Db.Where("uuid = ?", user_id).First(&dm_user)

	if dm_user.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	dm_channel := database.DMChannel{
		FromUser: ctx.User.ID,
		ToUser:   dm_user.ID,
	}
	ctx.Db.Where(&dm_channel).First(&dm_channel)
	if dm_channel.ID == 0 {
		dm_channel = database.DMChannel{
			FromUser: dm_user.ID,
			ToUser:   ctx.User.ID,
		}
		ctx.Db.Where(&dm_channel).First(&dm_channel)
	}
	var res response.DMChannel

	if dm_channel.ID == 0 {
		dm_channel := database.DMChannel{
			Uuid:      uuid.New().String(),
			FromUser:  ctx.User.ID,
			ToUser:    dm_user.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		ctx.Db.Create(&dm_channel)
		fmt.Println("Created! :", dm_channel.Uuid)

		res = response.DMChannel{
			Uuid: dm_channel.Uuid,
			Recipient: response.User{
				Uuid:      dm_user.Uuid,
				Avatar:    dm_user.Avatar,
				Username:  dm_user.Username,
				CreatedAt: dm_user.CreatedAt.Unix(),
			},
		}
	} else {
		res = response.DMChannel{
			Uuid: dm_channel.Uuid,
			Recipient: response.User{
				Uuid:      dm_user.Uuid,
				Avatar:    dm_user.Avatar,
				Username:  dm_user.Username,
				CreatedAt: dm_user.CreatedAt.Unix(),
			},
		}
	}

	res_, err := json.Marshal(res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}
	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res_)
}
