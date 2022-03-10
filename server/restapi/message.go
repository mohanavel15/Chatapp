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
	"gorm.io/gorm"
)

func GetMessages(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	vars := mux.Vars(r)
	channel_id := vars["id"]

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
	db.Where("channel_id = ?", channel.ID).Find(&messages)

	channel_res := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        channel.Owner,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	messages_res := []response.Message{}
	for _, message := range messages {
		var author database.Account
		db.Where("id = ?", message.AccountID).First(&author)

		user_res := response.User{
			Uuid:      author.Uuid,
			Avatar:    author.Avatar,
			Username:  author.Username,
			CreatedAt: author.CreatedAt.String(),
			UpdatedAt: author.UpdatedAt.String(),
		}

		message_res := response.Message{
			Uuid:      message.Uuid,
			Content:   message.Content,
			Author:    user_res,
			Channel:   channel_res,
			CreatedAt: message.CreatedAt.String(),
			EditedAt:  message.UpdatedAt.String(),
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

func CreateMessage(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	vars := mux.Vars(r)
	channel_id := vars["id"]

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

	new_message := database.Message{
		Uuid:      uuid.New().String(),
		Content:   message_req.Content,
		AccountID: user.ID,
		ChannelID: channel.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	db.Create(&new_message)

	author_res := response.User{
		Uuid:      user.Uuid,
		Avatar:    user.Avatar,
		Username:  user.Username,
		CreatedAt: user.CreatedAt.String(),
		UpdatedAt: user.UpdatedAt.String(),
	}

	channel_res := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        channel.Owner,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	message_res := response.Message{
		Uuid:      new_message.Uuid,
		Content:   new_message.Content,
		Author:    author_res,
		Channel:   channel_res,
		CreatedAt: new_message.CreatedAt.String(),
		EditedAt:  new_message.UpdatedAt.String(),
	}

	res, err := json.Marshal(message_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func GetMessage(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	vars := mux.Vars(r)
	channel_id := vars["id"]
	message_id := vars["mid"]

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
		CreatedAt: author.CreatedAt.String(),
		UpdatedAt: author.UpdatedAt.String(),
	}

	channel_res := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        channel.Owner,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	message_res := response.Message{
		Uuid:      message.Uuid,
		Content:   message.Content,
		Author:    author_res,
		Channel:   channel_res,
		CreatedAt: message.CreatedAt.String(),
		EditedAt:  message.UpdatedAt.String(),
	}

	res, err := json.Marshal(message_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func EditMessage(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	vars := mux.Vars(r)
	channel_id := vars["id"]
	message_id := vars["mid"]

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

	message.Content = message_req.Content
	message.UpdatedAt = time.Now()
	db.Save(&message)

	author_res := response.User{
		Uuid:      user.Uuid,
		Avatar:    user.Avatar,
		Username:  user.Username,
		CreatedAt: user.CreatedAt.String(),
		UpdatedAt: user.UpdatedAt.String(),
	}

	channel_res := response.Channel{
		Uuid:           channel.Uuid,
		Name:           channel.Name,
		Icon:           channel.Icon,
		OwnerID:        channel.Owner,
		PrivateChannel: channel.PrivateChannel,
		CreatedAt:      channel.CreatedAt.String(),
		UpdatedAt:      channel.UpdatedAt.String(),
	}

	message_res := response.Message{
		Uuid:      message.Uuid,
		Content:   message.Content,
		Author:    author_res,
		Channel:   channel_res,
		CreatedAt: message.CreatedAt.String(),
		EditedAt:  message.UpdatedAt.String(),
	}

	res, err := json.Marshal(message_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func DeleteMessage(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	vars := mux.Vars(r)
	channel_id := vars["id"]
	message_id := vars["mid"]

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
