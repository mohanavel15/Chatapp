package main

import (
	"Chatapp/database"
	"Chatapp/restapi"
	"Chatapp/websocket"
	"net/http"

	"gorm.io/gorm"
)

type IDBFunction func(w http.ResponseWriter, r *http.Request, db *gorm.DB)
type AuthFunction func(ctx *restapi.Context)

func IncludeDB(function IDBFunction) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		function(w, r, db)
	}
}

func Authenticated(function AuthFunction) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		access_token := r.Header.Get("Authorization")

		if access_token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		is_valid, session := restapi.ValidateAccessToken(access_token, db)
		if is_valid != true {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var account database.Account
		db.Where("id = ? ", session.AccountID).First(&account)

		if account.Uuid == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		conns := websocket.Connections{
			Queue:    queue,
			Users:    onlineUsers,
			Channels: channels,
		}

		ctx := restapi.Context{
			Res:  w,
			Req:  r,
			Db:   db,
			User: account,
			Conn: &conns,
		}

		function(&ctx)
	}
}
