package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"context"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetUser(ctx *Context) {
	user_res := response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex()))
	ctx.WriteJSON(user_res)
}

func EditUser(ctx *Context) {
	var request request.User
	err := json.NewDecoder(ctx.Req.Body).Decode(&request)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	avatar := request.Avatar
	if avatar == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	file_type_regx := regexp.MustCompile("image/(png|jpeg|gif)")
	file_ext_regx := regexp.MustCompile("png|jpeg|gif")

	file_type := file_type_regx.FindString(avatar)
	if file_type == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	file_ext := file_ext_regx.FindString(file_type)

	avatarB64 := avatar[strings.Index(avatar, ",")+1:]

	avatar_db := database.Avatar{
		ID:     primitive.NewObjectID(),
		Ext:    file_ext,
		Type:   file_type,
		Avatar: avatarB64,
	}

	users := ctx.Db.Collection("users")
	_, err = users.UpdateOne(context.TODO(), bson.M{"_id": ctx.User.ID}, bson.M{"$set": bson.M{"avatar": avatar_db}})
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}
	ctx.User.Avatar = avatar_db
	user_res := response.NewUser(&ctx.User, ctx.Conn.GetUserStatus(ctx.User.ID.Hex()))
	ctx.WriteJSON(user_res)
}
