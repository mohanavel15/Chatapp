package main

import (
	"Chatapp/database"
	"Chatapp/restapi"
	"Chatapp/utils"
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type IDBFunction func(w http.ResponseWriter, r *http.Request, db *mongo.Database)
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

		is_valid, session := utils.ValidateAccessToken(access_token, db)
		if !is_valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var user database.User
		users := db.Collection("users")

		err := users.FindOne(context.TODO(), bson.M{"_id": session.AccountID}).Decode(&user)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
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
