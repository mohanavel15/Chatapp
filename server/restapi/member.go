package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"encoding/json"
	"net/http"

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
	var res_members []response.User

	db.Where("channel_id = ?", channel.ID).Find(&members)
	for _, member := range members {
		var user database.Account
		db.Where("id = ?", member.AccountID).First(&user)
		if user.ID == 0 {
			continue
		}

		res_members = append(res_members, response.User{
			Uuid:      user.Uuid,
			Username:  user.Username,
			Avatar:    user.Avatar,
			CreatedAt: user.CreatedAt.String(),
			UpdatedAt: user.UpdatedAt.String(),
		})
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
	db.Where("uuid = ?", member_id).First(&user)
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

	res_member := response.User{
		Uuid:      member.Uuid,
		Username:  member.Username,
		Avatar:    member.Avatar,
		CreatedAt: member.CreatedAt.String(),
		UpdatedAt: member.UpdatedAt.String(),
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

	db.Delete(&is_member)
	w.WriteHeader(http.StatusOK)
}
