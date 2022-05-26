package restapi

import (
	"Chatapp/response"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"

	"github.com/google/uuid"
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
	file, handler, err := ctx.Req.FormFile("file")
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}
	defer file.Close()

	file_type_regx := regexp.MustCompile("image/.+")
	file_type := file_type_regx.FindString(handler.Header["Content-Type"][0])
	if file_type == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	ext_regx := regexp.MustCompile("\\.[\\w]+$")
	ext := ext_regx.FindString(handler.Filename)

	new_file_id := uuid.New().String()
	new_file_name := fmt.Sprintf("%s%s", new_file_id, ext)
	upload_folder := fmt.Sprintf("files/avatars/%s/", ctx.User.Uuid)

	_, err = os.Stat(upload_folder)
	if os.IsNotExist(err) {
		err := os.Mkdir(upload_folder, 0750)
		if err != nil {
			ctx.Res.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	new_file_name_with_path := fmt.Sprintf("%s%s", upload_folder, new_file_name)
	new_file, err := os.OpenFile(new_file_name_with_path, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer new_file.Close()
	io.Copy(new_file, file)

	url := fmt.Sprintf("http://127.0.0.1:5000/avatars/%s/%s", ctx.User.Uuid, new_file_name)

	ctx.User.Avatar = url
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
