package main

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/restapi"
	"Chatapp/pkg/utils"
	"net/http"
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

		access_token := r.Header.Get("Authorization")

		if access_token == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		is_valid, session := utils.ValidateAccessToken(access_token, db.Mongo)
		if !is_valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		user, statusCode := db.GetUser(session.AccountID.Hex())

		if statusCode != http.StatusOK {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		ctx := restapi.Context{
			Res:  w,
			Req:  r,
			Db:   db,
			User: *user,
			Conn: conns,
		}

		function(&ctx)
	}
}
