package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"os"
	"time"

	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var JWT_SECRET = os.Getenv("JWT_SECRET")

func Register(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var request request.Signup
	_ = json.NewDecoder(r.Body).Decode(&request)

	username := strings.TrimSpace(request.Username)
	password := strings.TrimSpace(request.Password)
	email := strings.TrimSpace(request.Email)

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

	email_regex := regexp.MustCompile("[a-z]+@[a-z]+\\.[a-z]+")
	if !email_regex.MatchString(email) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid Email"))
		return
	}

	var account1 database.Account
	db.Where("email = ?", email).First(&account1)
	if account1.ID != 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Email already exists"))
	}

	var account2 database.Account
	db.Where("username = ?", username).First(&account2)
	if account2.ID != 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Username already exists"))
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Password Hashing Failed :", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Something went Wrong"))
		return
	}

	new_account := database.Account{
		Uuid:     uuid.New().String(),
		Username: request.Username,
		Email:    request.Email,
		Password: string(hashedPassword),
	}
	db.Create(&new_account)
	w.WriteHeader(http.StatusOK)
}

func Login(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var request request.Signin
	_ = json.NewDecoder(r.Body).Decode(&request)

	username := strings.TrimSpace(request.Username)
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

	var account database.Account
	db.Where("username = ?", username).First(&account)

	err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(request.Password))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Invalid username or password"))
		return
	}

	accessToken, err := GenerateJWT(account.Uuid)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to generate access token"))
		return
	}

	var session database.Session

	response := response.Signin_Response{
		AccessToken: accessToken,
		ClientToken: request.ClientToken,
	}

	if request.ClientToken != "" {
		result := db.Find(&database.Session{}, "client_token = ?", request.ClientToken)
		if result.RowsAffected > 0 {
			db.Model(&database.Session{}).Where("client_token = ?", request.ClientToken).Update("access_token", accessToken)
			db.Where("client_token = ?", request.ClientToken).First(&session)
			json.NewEncoder(w).Encode(response)
			return
		}
	}
	session = database.Session{
		Uuid:        account.Uuid,
		AccessToken: accessToken,
		ClientToken: uuid.New().String(),
		AccountID:   account.ID,
	}
	db.Create(&session)
	response.ClientToken = session.ClientToken
	json.NewEncoder(w).Encode(response)
}

func Logout(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	access_token := r.Header.Get("Authorization")
	if access_token == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	is_valid, session := ValidateAccessToken(access_token, db)
	if is_valid != true {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	db.Delete(&session)
	w.WriteHeader(http.StatusOK)
}

func Signout(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	access_token := r.Header.Get("Authorization")
	if access_token == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	is_valid, session := ValidateAccessToken(access_token, db)
	if is_valid != true {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	db.Where("uuid = ?", &session.Uuid).Delete(database.Session{})
	w.WriteHeader(http.StatusOK)
}

func ChangePassword(ctx *Context) {
	var request request.ChangePassword
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)

	if request.CurrentPassword == "" || request.NewPassword == "" {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		return
	}

	var account database.Account
	ctx.Db.Where("uuid = ?", ctx.User.Uuid).First(&account)

	err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(request.CurrentPassword))
	if err != nil {
		ctx.Res.WriteHeader(http.StatusBadRequest)
		ctx.Res.Write([]byte("Invalid password"))
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(fmt.Sprintf("Password Hashing Failed : %s", err))
	}

	account.Password = string(hashedPassword)
	ctx.Db.Save(&account)

	ctx.Db.Where("uuid = ?", account.Uuid).Delete(database.Session{})
	ctx.Res.WriteHeader(http.StatusOK)
}

func Refresh(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var request request.Refresh
	_ = json.NewDecoder(r.Body).Decode(&request)

	if request.ClientToken == "" || request.AccessToken == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	session := database.Session{
		AccessToken: request.AccessToken,
	}

	db.Where("access_token = ?", request.AccessToken).First(&session)
	if session.ID == 0 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	uuid, err := ValidateJWT(request.AccessToken)
	if err == nil && session.Uuid == uuid {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if err.Error() != "Token is expired" || session.ClientToken != request.ClientToken {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	accessToken, err := GenerateJWT(session.Uuid)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to generate access token"))
		return
	}

	session.AccessToken = accessToken
	db.Save(&session)

	response := response.Signin_Response{
		AccessToken: accessToken,
		ClientToken: request.ClientToken,
	}

	json.NewEncoder(w).Encode(response)
}

func ValidateAccessToken(AccessToken string, db *gorm.DB) (bool, database.Session) {
	uuid, err := ValidateJWT(AccessToken)
	if err != nil {
		return false, database.Session{}
	}
	var session database.Session
	db.Where("access_token = ?", AccessToken).First(&session)
	if session.Uuid == uuid {
		return true, session
	}
	return false, database.Session{}
}

func GenerateJWT(uuid string) (string, error) {
	secret_key := []byte(JWT_SECRET)
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	claims["uuid"] = uuid
	claims["iat"] = time.Now().Unix()
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	tokenString, err := token.SignedString(secret_key)

	if err != nil {
		log.Fatal(fmt.Sprintf("Couldn't sign the token: %s", err))
		return "", err
	}
	return tokenString, nil
}

func ValidateJWT(tokenString string) (string, error) {
	secret_key := []byte(JWT_SECRET)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("There was an error")
		}
		return secret_key, nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		uuid := claims["uuid"].(string)
		return uuid, nil
	} else {
		return "", fmt.Errorf("Token is invalid")
	}
}
