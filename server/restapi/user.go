package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
)

func GetUser(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	user_res := response.User{
		Uuid:      user.Uuid,
		Username:  user.Username,
		Avatar:    user.Avatar,
		CreatedAt: user.CreatedAt.String(),
		UpdatedAt: user.UpdatedAt.String(),
	}

	res, err := json.Marshal(user_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func EditUser(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account) {
	var request request.User
	_ = json.NewDecoder(r.Body).Decode(&request)

	if request.Avatar == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	user.Avatar = request.Avatar
	db.Save(&user)

	user_res := response.User{
		Uuid:      user.Uuid,
		Username:  user.Username,
		Avatar:    user.Avatar,
		CreatedAt: user.CreatedAt.String(),
		UpdatedAt: user.UpdatedAt.String(),
	}

	res, err := json.Marshal(user_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
