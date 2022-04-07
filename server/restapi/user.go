package restapi

import (
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
)

func GetUser(ctx *Context) {
	_, w, _, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

	user_res := response.User{
		Uuid:      user.Uuid,
		Username:  user.Username,
		Avatar:    user.Avatar,
		CreatedAt: user.CreatedAt.Unix(),
	}

	res, err := json.Marshal(user_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func EditUser(ctx *Context) {
	r, w, db, user := ctx.Req, ctx.Res, ctx.Db, ctx.User

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
		CreatedAt: user.CreatedAt.Unix(),
	}

	res, err := json.Marshal(user_res)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
