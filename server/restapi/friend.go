package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"Chatapp/websocket"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func GetFriends(ctx *Context) {
	w, db, user := ctx.Res, ctx.Db, ctx.User

	var friendsDB []database.Friend
	db.Where("from_user = ?", user.ID).Find(&friendsDB)

	var friendsDBIncoming []database.Friend
	db.Where("to_user = ?", user.ID).Find(&friendsDBIncoming)

	res_friends := []response.Friend{}

	for _, friend := range friendsDB {
		friend_user := database.Account{
			ID: friend.ToUser,
		}
		db.Where(&friend_user).First(&friend_user)

		if friend_user.ID == 0 {
			continue
		}

		_, ok := ctx.Conn.Users[friend_user.Uuid]
		status := 0
		if ok {
			status = 1
		}

		res_friend := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				Status:    status,
				CreatedAt: friend_user.CreatedAt.Unix(),
			},
			Pending:  false,
			Incoming: false,
		}

		friend_check := database.Friend{
			FromUser: friend_user.ID,
			ToUser:   user.ID,
		}
		db.Where(&friend_check).First(&friend_check)
		if friend_check.ID == 0 {
			res_friend.Pending = true
		}

		res_friends = append(res_friends, res_friend)
	}

	for _, friend := range friendsDBIncoming {
		friend_user := database.Account{
			ID: friend.FromUser,
		}
		db.Where(&friend_user).First(&friend_user)

		if friend_user.ID == 0 {
			continue
		}
		res_friend := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				CreatedAt: friend_user.CreatedAt.Unix(),
			},
			Incoming: true,
		}

		friend_check := database.Friend{
			FromUser: user.ID,
			ToUser:   friend_user.ID,
		}
		db.Where(&friend_check).First(&friend_check)
		if friend_check.ID != 0 {
			continue
		}
		res_friend.Pending = true
		res_friends = append(res_friends, res_friend)
	}

	res, err := json.Marshal(res_friends)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func AddOrAcceptFriend(ctx *Context) {
	w, db, user := ctx.Res, ctx.Db, ctx.User

	var pending bool = true
	var incoming bool = true

	var req request.AddFriend
	err := json.NewDecoder(ctx.Req.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	friend_user := database.Account{
		Uuid: req.To,
	}
	db.Where(&friend_user).First(&friend_user)
	if friend_user.ID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	friend := database.Friend{
		FromUser: user.ID,
		ToUser:   friend_user.ID,
	}

	db.Where(&friend).First(&friend)
	if friend.ID != 0 {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	db.Create(&friend)

	friend_check := database.Friend{
		FromUser: friend_user.ID,
		ToUser:   user.ID,
	}
	db.Where(&friend_check).First(&friend_check)
	if friend_check.ID != 0 {
		pending = false
		incoming = false
	}

	w.WriteHeader(http.StatusOK)

	if ws, ok := ctx.Conn.Users[friend_user.Uuid]; ok {
		res_user := response.Friend{
			User: response.User{
				Uuid:      user.Uuid,
				Username:  user.Username,
				Avatar:    user.Avatar,
				CreatedAt: user.CreatedAt.Unix(),
			},
			Pending:  pending,
			Incoming: incoming,
		}

		ws_msg := websocket.WS_Message{
			Event: "FRIEND_MODIFY",
			Data:  res_user,
		}

		ws_res, _ := json.Marshal(ws_msg)
		ws.Write(ws_res)
	}

	if ws, ok := ctx.Conn.Users[user.Uuid]; ok {
		res_user := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				CreatedAt: friend_user.CreatedAt.Unix(),
			},
			Pending:  pending,
			Incoming: false,
		}

		ws_msg := websocket.WS_Message{
			Event: "FRIEND_MODIFY",
			Data:  res_user,
		}

		ws_res, _ := json.Marshal(ws_msg)
		ws.Write(ws_res)
	}
}

func GetFriend(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	friend_id := url_vars["fid"]

	friend_user := database.Account{
		Uuid: friend_id,
	}

	ctx.Db.Where(&friend_user).First(&friend_user)
	if friend_user.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	friend_check := database.Friend{
		FromUser: ctx.User.ID,
		ToUser:   friend_user.ID,
	}
	ctx.Db.Where(&friend_check).First(&friend_check)

	friend_check2 := database.Friend{
		FromUser: friend_user.ID,
		ToUser:   ctx.User.ID,
	}

	ctx.Db.Where(&friend_check2).First(&friend_check2)

	if friend_check.ID == 0 && friend_check2.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	_, ok := ctx.Conn.Users[friend_user.Uuid]
	status := 0
	if ok {
		status = 1
	}

	res_friend := response.Friend{
		User: response.User{
			Uuid:      friend_user.Uuid,
			Username:  friend_user.Username,
			Avatar:    friend_user.Avatar,
			Status:    status,
			CreatedAt: friend_user.CreatedAt.Unix(),
		},
		Pending:  false,
		Incoming: false,
	}

	if friend_check.ID == 0 || friend_check2.ID == 0 {
		res_friend.Pending = true
	}

	if friend_check.ID == 0 && friend_check2.ID != 0 {
		res_friend.Incoming = true
	}

	res, err := json.Marshal(res_friend)
	if err != nil {
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		return
	}

	ctx.Res.Header().Set("Content-Type", "application/json")
	ctx.Res.Write(res)
}

func RemoveOrDeclineFriend(ctx *Context) {
	url_vars := mux.Vars(ctx.Req)
	friend_id := url_vars["fid"]

	friend_user := database.Account{
		Uuid: friend_id,
	}

	ctx.Db.Where(&friend_user).First(&friend_user)
	if friend_user.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	friend_check := database.Friend{
		FromUser: ctx.User.ID,
		ToUser:   friend_user.ID,
	}
	ctx.Db.Where(&friend_check).First(&friend_check)

	friend_check2 := database.Friend{
		FromUser: friend_user.ID,
		ToUser:   ctx.User.ID,
	}

	ctx.Db.Where(&friend_check2).First(&friend_check2)

	if friend_check.ID == 0 && friend_check2.ID == 0 {
		ctx.Res.WriteHeader(http.StatusNotFound)
		return
	}

	if friend_check.ID != 0 {
		ctx.Db.Delete(&friend_check)
	}

	if friend_check2.ID != 0 {
		ctx.Db.Delete(&friend_check2)
	}

	ctx.Res.WriteHeader(http.StatusOK)

	UserWs, UserConnected := ctx.Conn.Users[ctx.User.Uuid]
	friendUserWs, friendUserConnected := ctx.Conn.Users[friend_user.Uuid]

	if friendUserConnected {
		status := 0
		if UserConnected {
			status = 1
		}
		res_user := response.Friend{
			User: response.User{
				Uuid:      ctx.User.Uuid,
				Username:  ctx.User.Username,
				Avatar:    ctx.User.Avatar,
				Status:    status,
				CreatedAt: ctx.User.CreatedAt.Unix(),
			},
			Pending:  false,
			Incoming: false,
		}

		ws_msg := websocket.WS_Message{
			Event: "FRIEND_DELETE",
			Data:  res_user,
		}

		ws_res, _ := json.Marshal(ws_msg)
		friendUserWs.Write(ws_res)
	}

	if UserConnected {
		status := 0
		if friendUserConnected {
			status = 1
		}
		res_user := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				Status:    status,
				CreatedAt: friend_user.CreatedAt.Unix(),
			},
			Pending:  false,
			Incoming: false,
		}

		ws_msg := websocket.WS_Message{
			Event: "FRIEND_DELETE",
			Data:  res_user,
		}

		ws_res, _ := json.Marshal(ws_msg)
		UserWs.Write(ws_res)
	}
}
