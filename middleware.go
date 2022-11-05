package main

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/restapi"
	"Chatapp/pkg/utils"
	"net/http"
	"time"
)

type IDBFunction func(w http.ResponseWriter, r *http.Request, db *database.Database)
type AuthFunction func(ctx *restapi.Context)

func IncludeDB(function IDBFunction) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		function(w, r, db)
	}
}

func Authenticated(function AuthFunction) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access_token")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		is_valid, user := utils.ValidateAccessToken(cookie.Value, db.Mongo)

		if !is_valid {
			w.WriteHeader(http.StatusUnauthorized)
			http.SetCookie(w, &http.Cookie{
				Name:     "access_token",
				Value:    "",
				Path:     "/",
				HttpOnly: true,
				Expires:  time.Now().Add(time.Hour * -1),
			})
			return
		}

		ctx := restapi.Context{
			Res:  w,
			Req:  r,
			Db:   db,
			User: user,
			Conn: conns,
		}

		function(&ctx)
	}
}
