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

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var JWT_SECRET = os.Getenv("JWT_SECRET")

func Register(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var request request.Signup
	_ = json.NewDecoder(r.Body).Decode(&request)

	if request.Username == "" || request.Email == "" || request.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	email_regex := regexp.MustCompile("[a-z]+@[a-z]+\\.[a-z]+")
	if !email_regex.MatchString(request.Email) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(fmt.Sprintf("Password Hashing Failed : %s", err))
	}

	account := database.Account{
		Uuid:     uuid.New().String(),
		Username: request.Username,
		Email:    request.Email,
		Password: string(hashedPassword),
	}
	db.Create(&account)
	w.Write([]byte("Successfully registered"))
}

func Login(w http.ResponseWriter, r *http.Request, db *gorm.DB) {
	var request request.Signin
	_ = json.NewDecoder(r.Body).Decode(&request)

	if request.Username == "" || request.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var account database.Account
	db.Where("username = ?", request.Username).First(&account)

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
