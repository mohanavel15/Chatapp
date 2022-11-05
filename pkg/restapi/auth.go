package restapi

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/request"
	"Chatapp/pkg/utils"
	"context"
	"time"

	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func Register(w http.ResponseWriter, r *http.Request, db *database.Database) {
	var request request.Signup
	_ = json.NewDecoder(r.Body).Decode(&request)
	collection := db.Mongo.Collection("users")

	username := strings.ToLower(strings.TrimSpace(request.Username))
	password := strings.TrimSpace(request.Password)
	email := strings.ToLower(strings.TrimSpace(request.Email))

	if username == "" || password == "" || email == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username, Email or Password can't be empty"))
		return
	}

	if strings.Contains(username, " ") || strings.Contains(email, " ") {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username or Email can't have spaces"))
		return
	}

	if len(username) < 3 || len(username) > 20 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username must be between 3 and 20 characters"))
		return
	}

	email_regex := regexp.MustCompile(`[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9-]+)*$`)
	if !email_regex.MatchString(email) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid Email"))
		return
	}

	err := collection.FindOne(context.TODO(), bson.M{"email": email}).Err()
	if err == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Email already exists"))
		return
	}

	err = collection.FindOne(context.TODO(), bson.M{"username": username}).Err()
	if err == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username already exists"))
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Password Hashing Failed :", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Something went Wrong"))
		return
	}

	new_account := database.User{
		ID:         primitive.NewObjectID(),
		Username:   request.Username,
		Email:      request.Email,
		Password:   hashedPassword,
		CreatedAt:  time.Now().Unix(),
		LastLogout: 0,
	}

	collection.InsertOne(context.TODO(), &new_account)
	w.WriteHeader(http.StatusOK)
}

func Login(w http.ResponseWriter, r *http.Request, db *database.Database) {
	users := db.Mongo.Collection("users")

	var request request.Signin
	_ = json.NewDecoder(r.Body).Decode(&request)

	username := strings.ToLower(strings.TrimSpace(request.Username))
	password := strings.TrimSpace(request.Password)

	if username == "" || password == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username or Password can't be empty"))
		return
	}

	if strings.Contains(username, " ") {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username can't have spaces"))
		return
	}

	var user database.User
	err := users.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid username or password"))
		return
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(request.Password))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid username or password"))
		return
	}

	accessToken, err := utils.GenerateJWT(user.ID.Hex())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to generate access token"))
		return
	}

	cookie := http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		Expires:  time.Now().Add(time.Hour * 24 * 365 * 100),
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)
}

func Logout(ctx *Context) {
	users := ctx.Db.Mongo.Collection("users")
	users.UpdateOne(context.TODO(), bson.M{"_id": ctx.User.ID}, bson.M{"$set": bson.M{"last_logout": time.Now().Unix()}})
	http.SetCookie(ctx.Res, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})
}

func ChangePassword(ctx *Context) {
	var request request.ChangePassword
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)
	collection := ctx.Db.Mongo.Collection("users")

	currentPassword := strings.TrimSpace(request.CurrentPassword)
	newPassword := strings.TrimSpace(request.NewPassword)

	if currentPassword == "" || newPassword == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	err := bcrypt.CompareHashAndPassword(ctx.User.Password, []byte(request.CurrentPassword))
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		ctx.Res.Write([]byte("Invalid password"))
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Password Hashing Failed :", err.Error())
		ctx.Res.WriteHeader(http.StatusInternalServerError)
		ctx.Res.Write([]byte("Something went Wrong"))
		return
	}

	ctx.User.Password = hashedPassword
	collection.UpdateOne(context.TODO(), bson.M{"_id": ctx.User.ID}, bson.M{"$set": bson.M{"password": hashedPassword}})
	ctx.Res.WriteHeader(http.StatusOK)
}
