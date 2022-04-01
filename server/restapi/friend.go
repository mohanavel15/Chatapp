package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"encoding/json"
	"net/http"
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

		res_friend := response.Friend{
			User: response.User{
				Uuid:      friend_user.Uuid,
				Username:  friend_user.Username,
				Avatar:    friend_user.Avatar,
				CreatedAt: friend_user.CreatedAt.String(),
				UpdatedAt: friend_user.UpdatedAt.String(),
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
				CreatedAt: friend_user.CreatedAt.String(),
				UpdatedAt: friend_user.UpdatedAt.String(),
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
	w.WriteHeader(http.StatusOK)
}
