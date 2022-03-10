package restapi

import (
	"Chatapp/database"
	"Chatapp/response"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func JoinInvite(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
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

	members := database.Member{
		ChannelID: channel.ID,
		AccountID: user.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&members)
}

func GetInvites(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
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

func CreateInvite(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
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

func DeleteInvite(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
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
