package main

import (
	"Chatapp/database"
	"net/http"

	"gorm.io/gorm"
)

type IDBFunction func(w http.ResponseWriter, r *http.Request, db *gorm.DB)
type AuthFunction func(w http.ResponseWriter, r *http.Request, db *gorm.DB, user database.Account)

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

		var session database.Session
		db.Where("access_token = ?", access_token).First(&session)

		if session.Uuid == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var account database.Account
		db.Where("id = ? ", session.AccountID).First(&account)

		if account.Uuid == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		function(w, r, db, account)
	}
}
