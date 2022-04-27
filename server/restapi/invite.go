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
	}
	db.Where(&member).First(&member)
	if member.ID != 0 {
		ctx.Res.WriteHeader(http.StatusAccepted)
		return
	}

	member = database.Member{
		ChannelID: channel.ID,
		AccountID: user.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&member)

	res_channel := response.NewChannel(&channel)

	res, err := json.Marshal(res_channel)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	res_member_user := response.NewUser(&ctx.User, 0)
	if user, ok := ctx.Conn.Users[ctx.User.Uuid]; ok {
		res_member_user.Status = 1
		_, ok := ctx.Conn.Channels[channel.Uuid]
		if !ok {
			ctx.Conn.Channels[channel.Uuid] = make(map[string]*websocket.Ws)
		}
		ctx.Conn.Channels[channel.Uuid][ctx.User.Uuid] = user
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)

	res_member := response.NewMember(&res_member_user, &channel, &member)
	websocket.BroadcastToChannel(ctx.Conn, channel.Uuid, "MEMBER_JOIN", res_member)
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
