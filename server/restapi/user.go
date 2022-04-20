package restapi

import (
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
)

func GetUser(ctx *Context) {
	user_res := response.NewUser(&ctx.User, 0)

	res, err := json.Marshal(user_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func EditUser(ctx *Context) {
	var request request.User
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)

	if request.Avatar == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	ctx.User.Avatar = request.Avatar
	ctx.Db.Save(&ctx.User)

	user_res := response.NewUser(&ctx.User, 0)

	res, err := json.Marshal(user_res)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}
