package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func GetDMChannels(ctx *Context) {
	dm_channels := database.GetDMChannels(&ctx.User, ctx.Db)
	res_dm_channels := []response.DMChannel{}

	for _, dm_channel := range dm_channels {
		var dm_user database.Account
		if dm_channel.FromUser != ctx.User.ID {
			ctx.Db.Where("id = ?", dm_channel.FromUser).First(&dm_user)
		} else {
			ctx.Db.Where("id = ?", dm_channel.ToUser).First(&dm_user)
		}

		status := 0
		if _, ok := ctx.Conn.Users[dm_user.Uuid]; ok {
			status = 1
		}

		res_user := response.NewUser(&dm_user, status)
		res_dm_channels = append(res_dm_channels, response.DMChannel{
			Uuid:      dm_channel.Uuid,
			Recipient: res_user,
		})
	}

	res_, err := json.Marshal(res_dm_channels)
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

	dm_channel, dm_user, statusCode := database.GetUserDM(user_id, &ctx.User, ctx.Db)
	if statusCode != http.StatusOK {
		ctx.Res.WriteHeader(statusCode)
		return
	}

	status := 0
	if _, ok := ctx.Conn.Users[dm_user.Uuid]; ok {
		status = 1
	}

	res := response.DMChannel{
		Uuid:      dm_channel.Uuid,
		Recipient: response.NewUser(dm_user, status),
	}

	res_, err := json.Marshal(res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}
	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res_)
}
