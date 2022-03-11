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

func CreateChannel(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	var request request.Channel
	_ = json.NewDecoder(r.Body).Decode(&request)

	if request.Name == "" || request.Icon == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	channel := database.Channel{
		Uuid:           uuid.New().String(),
		Name:           request.Name,
		Icon:           request.Icon,
		Owner:          user.Uuid,
		PrivateChannel: false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	db.Create(&channel)

	members := database.Member{
		ChannelID: channel.ID,
		AccountID: user.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	db.Create(&members)

	response := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        user.Uuid,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}
	res, err := json.Marshal(response)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func GetChannels(ctx *Context) {
	_, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	var members []database.Member

	member := database.Member{
		AccountID: user.ID,
	}

	db.Where(&member).Find(&members)

	res_obj := []response.Channel{}

	for _, member := range members {
		var channel = database.Channel{
			ID: member.ChannelID,
		}
		db.Where(&channel).First(&channel)

		res_channel := response.Channel{
			Uuid:           channel.Uuid,
			Name:           channel.Name,
			Icon:           channel.Icon,
			OwnerID:        channel.Owner,
			PrivateChannel: channel.PrivateChannel,
			CreatedAt:      channel.CreatedAt.String(),
			UpdatedAt:      channel.UpdatedAt.String(),
		}

		res_obj = append(res_obj, res_channel)
	}

	res, err := json.Marshal(res_obj)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func GetChannel(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User
	url_vars := mux.Vars(r)
	channel_id := url_vars["id"]

	channel := database.Channel{
		Uuid: channel_id,
	}
	db.Where(&channel).First(&channel)
	if channel.Uuid == "" {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var member database.Member
	db.Where("channel_id = ? AND account_id = ?", channel.ID, user.ID).First(&member)

	if member.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	res_channel := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        channel.Owner,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	res, err := json.Marshal(res_channel)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func EditChannel(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	url_vars := mux.Vars(r)
	channel_id := url_vars["id"]

	var request request.Channel
	_ = json.NewDecoder(r.Body).Decode(&request)

	if request.Name == "" && request.Icon == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var channel database.Channel
	db.Where("uuid = ?", channel_id).First(&channel)

	if channel.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if channel.Owner != user.Uuid {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if request.Name != "" {
		channel.Name = request.Name
	}
	if request.Icon != "" {
		channel.Icon = request.Icon
	}
	channel.UpdatedAt = time.Now()
	db.Save(&channel)

	res_channel := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        channel.Owner,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	res, err := json.Marshal(res_channel)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)

}

func DeleteChannel(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	url_vars := mux.Vars(r)
	channel_id := url_vars["id"]

	channel := database.Channel{
		Uuid: channel_id,
	}
	db.Where(&channel).First(&channel)

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
	db.Delete(&member)
}
