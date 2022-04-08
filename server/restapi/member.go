package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func GetMembers(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]

	var channel database.Channel
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

	var members []database.Member
	var res_members []response.Member

	db.Where("channel_id = ?", channel.ID).Find(&members)
	for _, member := range members {
		var user database.Account
		db.Where("id = ?", member.AccountID).First(&user)
		if user.ID == 0 {
			continue
		}

		var status int
		isConnected := ctx.Conn.Users[user.Uuid]
		if isConnected == nil {
			status = 0
		} else {
			status = 1
		}

		res_member := response.Member{
			Uuid:      user.Uuid,
			Username:  user.Username,
			Avatar:    user.Avatar,
			Is_Owner:  channel.Owner == user.Uuid,
			Status:    status,
			ChannelID: channel.Uuid,
			JoinedAt:  member.CreatedAt.String(),
			CreatedAt: member.CreatedAt.String(),
		}

		res_members = append(res_members, res_member)
	}

	res_obj, err := json.Marshal(res_members)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res_obj)
}

func GetMember(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]
	member_id := vars["mid"]

	var channel database.Channel
	db.Where("uuid = ?", channel_id).First(&channel)
	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var is_user_member database.Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&is_user_member)
	if is_user_member.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var member database.Account
	db.Where("uuid = ?", member_id).First(&member)
	if user.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var is_member database.Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, member.ID).First(&is_member)
	if is_member.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var status int
	isConnected := ctx.Conn.Users[member.Uuid]
	if isConnected == nil {
		status = 0
	} else {
		status = 1
	}

	res_member := response.Member{
		Uuid:      member.Uuid,
		Username:  member.Username,
		Avatar:    member.Avatar,
		Is_Owner:  channel.Owner == member.Uuid,
		Status:    status,
		ChannelID: channel.Uuid,
		JoinedAt:  is_member.CreatedAt.String(),
		CreatedAt: member.CreatedAt.String(),
	}

	res, err := json.Marshal(res_member)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func DeleteMember(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]
	member_id := vars["mid"]

	var req request.KickorBan
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var channel database.Channel
	db.Where("uuid = ?", channel_id).First(&channel)
	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var is_user_member database.Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&is_user_member)
	if is_user_member.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var member database.Account
	db.Where("uuid = ?", member_id).First(&member)
	if member.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var is_member database.Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, member.ID).First(&is_member)
	if is_member.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if user.Uuid != channel.Owner {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if user.Uuid == member.Uuid {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if req.Ban == true {
		ban := database.Ban{
			BannedUser: member.ID,
			ChannelID:  channel.ID,
			BannedBy:   user.ID,
			Reason:     req.Reason,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		db.Create(&ban)
	}

	db.Delete(&is_member)
	w.WriteHeader(http.StatusOK)
}
