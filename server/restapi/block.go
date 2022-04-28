package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func GetBlocks(ctx *Context) {
	var blocks []database.Block
	ctx.Db.Where("blocked_by = ?", ctx.User.ID).Find(&blocks)

	res_blocks := []response.User{}
	for _, block := range blocks {
		var user database.Account
		ctx.Db.Where("id = ?", block.BlockedUser).First(&user)
		blocked_user := response.NewUser(&user, 0)
		res_blocks = append(res_blocks, blocked_user)
	}

	res, err := json.Marshal(res_blocks)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
	}

	ctx.Res.Write(res)
}

func AddBlock(ctx *Context) {
	var request request.Block
	err := json.NewDecoder(ctx.Req.Body).Decode(&request)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	var user database.Account
	ctx.Db.Where("uuid = ?", request.Uuid).First(&user)
	if user.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	friend := database.Friend{
		FromUser: ctx.User.ID,
		ToUser:   user.ID,
	}
	ctx.Db.Where(friend).First(&friend)
	if friend.ID != 0 {
		ctx.Db.Delete(&friend)
	}

	friend2 := database.Friend{
		FromUser: user.ID,
		ToUser:   ctx.User.ID,
	}
	ctx.Db.Where(friend2).First(&friend2)
	if friend2.ID != 0 {
		ctx.Db.Delete(&friend2)
		if ws, ok := ctx.Conn.Users[user.Uuid]; ok {
			ws_msg := websocket.WS_Message{
				Event: "FRIEND_DELETE",
				Data:  response.NewUser(&ctx.User, 0),
			}
			res, _ := json.Marshal(ws_msg)
			ws.Write(res)
		}
	}

	var block database.Block
	ctx.Db.Where("blocked_by = ? AND blocked_user = ?", ctx.User.ID, user.ID).First(&block)
	if block.ID != 0 {
		ctx.Res.WriteHeader(http.StatusConflict)
		return
	}

	ctx.Db.Create(&database.Block{
		BlockedBy:   ctx.User.ID,
		BlockedUser: user.ID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	})

	res_block_user := response.NewUser(&user, 0)
	res_json, err := json.Marshal(res_block_user)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Write(res_json)

	if ws, ok := ctx.Conn.Users[ctx.User.Uuid]; ok {
		ws_msg := websocket.WS_Message{
			Event: "BLOCK_CREATE",
			Data:  res_block_user,
		}

		res, err := json.Marshal(ws_msg)
		if err != nil {
			return
		}
		ws.Write(res)
	}
}

func DeleteBlock(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	bid := url_vars["bid"]

	var user database.Account
	ctx.Db.Where("uuid = ?", bid).First(&user)
	if user.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	var block database.Block
	ctx.Db.Where("blocked_by = ? AND blocked_user = ?", ctx.User.ID, user.ID).First(&block)
	if block.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	ctx.Db.Delete(&block)

	status := 0
	if _, ok := ctx.Conn.Users[ctx.User.Uuid]; ok {
		status = 1
	}

	res_user := response.NewUser(&user, status)
	res_json, err := json.Marshal(res_user)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Write(res_json)

	if ws, ok := ctx.Conn.Users[ctx.User.Uuid]; ok {
		ws_msg := websocket.WS_Message{
			Event: "BLOCK_DELETE",
			Data:  res_user,
		}

		res, err := json.Marshal(ws_msg)
		if err != nil {
			return
		}
		ws.Write(res)
	}
}
