package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func GetAllBans(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]

	channel := database.Channel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&channel).First(&channel)

	if channel.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	if ctx.User.Uuid != channel.Owner {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	var bans []database.Ban
	ctx.Db.Where("channel_id = ?", channel.ID).Find(&bans)

	res_channel := response.NewChannel(&channel)
	res_bans := []response.Ban{}

	for _, ban := range bans {
		var user database.Account
		ctx.Db.Where("id = ?", ban.BannedBy).First(&user)

		var status int
		isConnected := ctx.Conn.Users[user.Uuid]
		if isConnected == nil {
			status = 0
		} else {
			status = 1
		}
		bannedby := response.NewUser(&user, status)

		var banned_user database.Account
		ctx.Db.Where("id = ?", ban.BannedUser).First(&banned_user)

		var banned_user_status int
		isConnected2 := ctx.Conn.Users[banned_user.Uuid]
		if isConnected2 == nil {
			banned_user_status = 0
		} else {
			banned_user_status = 1
		}
		banneduser := response.NewUser(&banned_user, banned_user_status)

		res_ban := response.NewBan(bannedby, banneduser, res_channel, &ban)
		res_bans = append(res_bans, res_ban)
	}

	res, err := json.Marshal(res_bans)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.WriteHeader(http.StatusOK)
	ctx.Res.Write(res)
}

func GetBan(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	ban_id := url_vars["bid"]

	channel := database.Channel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&channel).First(&channel)

	if channel.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	ban := database.Ban{
		Uuid: ban_id,
	}
	ctx.Db.Where(&ban).First(&ban)

	if ban.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	if ctx.User.Uuid != channel.Owner {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	res_channel := response.NewChannel(&channel)

	var user database.Account
	ctx.Db.Where("id = ?", ban.BannedBy).First(&user)

	var status int
	isConnected := ctx.Conn.Users[user.Uuid]
	if isConnected == nil {
		status = 0
	} else {
		status = 1
	}
	bannedby := response.NewUser(&user, status)

	var banned_user database.Account
	ctx.Db.Where("id = ?", ban.BannedUser).First(&banned_user)

	var banned_user_status int
	isConnected2 := ctx.Conn.Users[banned_user.Uuid]
	if isConnected2 == nil {
		banned_user_status = 0
	} else {
		banned_user_status = 1
	}
	banneduser := response.NewUser(&banned_user, banned_user_status)

	res_ban := response.NewBan(bannedby, banneduser, res_channel, &ban)

	res, err := json.Marshal(res_ban)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.WriteHeader(http.StatusOK)
	ctx.Res.Write(res)
}

func DeleteBan(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	channel_id := url_vars["id"]
	ban_id := url_vars["bid"]

	channel := database.Channel{
		Uuid: channel_id,
	}
	ctx.Db.Where(&channel).First(&channel)

	if channel.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	ban := database.Ban{
		Uuid:      ban_id,
		ChannelID: channel.ID,
	}
	ctx.Db.Where(&ban).First(&ban)

	if ban.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	if ctx.User.Uuid != channel.Owner {
		ctx.Res.WriteHeader(http.StatusForbidden)
		return
	}

	ctx.Db.Delete(&ban)
	ctx.Res.WriteHeader(http.StatusOK)
}
