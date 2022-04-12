package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func JoinInvite(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	invite_code := vars["id"]

	invite := database.Invites{
		InviteCode: invite_code,
	}
	db.Where(&invite).First(&invite)

	if invite.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	channel := database.Channel{}
	db.Where("id = ?", invite.ChannelID).First(&channel)

	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	ban := database.Ban{
		BannedUser: user.ID,
		ChannelID:  channel.ID,
	}
	db.Where(&ban).First(&ban)
	if ban.ID != 0 {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	member := database.Member{
		ChannelID: channel.ID,
		AccountID: user.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&member)

	res := response.Channel{
		Uuid:      channel.Uuid,
		Name:      channel.Name,
		OwnerID:   channel.Owner,
		Icon:      channel.Icon,
		CreatedAt: channel.CreatedAt.String(),
		UpdatedAt: channel.UpdatedAt.String(),
	}

	res_obj, err := json.Marshal(res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res_obj)

	res_member := response.Member{
		Uuid:      user.Uuid,
		Username:  user.Username,
		Avatar:    user.Avatar,
		Is_Owner:  channel.Owner == user.Uuid,
		Status:    1,
		ChannelID: channel.Uuid,
		CreatedAt: user.CreatedAt.String(),
		JoinedAt:  member.CreatedAt.String(),
	}

	ws_msg := websocket.WS_Message{
		Event: "MEMBER_JOIN",
		Data:  res_member,
	}

	ws_res, _ := json.Marshal(ws_msg)

	if members, ok := ctx.Conn.Channels[channel.Uuid]; ok {
		for _, member := range members {
			member.Write(ws_res)
		}
	}
}

func GetInvites(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]

	channel := database.Channel{}
	db.Where("uuid = ?", channel_id).First(&channel)

	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if channel.Owner != user.Uuid {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	invites := []database.Invites{}
	db.Where("channel_id = ?", channel.ID).Find(&invites)

	if len(invites) == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var invites_res_obj []response.Invite
	for _, invite := range invites {
		invite_obj := response.Invite{
			InviteCode: invite.InviteCode,
			CreatedAt:  invite.CreatedAt.String(),
		}
		invites_res_obj = append(invites_res_obj, invite_obj)
	}

	res, err := json.Marshal(invites_res_obj)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func CreateInvite(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]

	channel := database.Channel{}
	db.Where("uuid = ?", channel_id).First(&channel)

	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if channel.Owner != user.Uuid {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	invite := database.Invites{
		InviteCode: uuid.New().String(),
		ChannelID:  channel.ID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	db.Create(&invite)

	res, err := json.Marshal(response.Invite{
		InviteCode: invite.InviteCode,
		CreatedAt:  invite.CreatedAt.String(),
	})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func DeleteInvite(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	vars := mux.Vars(r)
	channel_id := vars["id"]
	invite_code := vars["iid"]

	channel := database.Channel{}
	db.Where("uuid = ?", channel_id).First(&channel)

	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if channel.Owner != user.Uuid {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	invite := database.Invites{
		InviteCode: invite_code,
		ChannelID:  channel.ID,
	}
	db.Where(&invite).First(&invite)

	if invite.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	db.Delete(&invite)
}
