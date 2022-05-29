package restapi

import (
	"Chatapp/database"
	"Chatapp/request"
	"Chatapp/response"
	"context"
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
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var JWT_SECRET = os.Getenv("JWT_SECRET")

func Register(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
	var request request.Signup
	_ = json.NewDecoder(r.Body).Decode(&request)
	collection := db.Collection("users")

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

	user1 := database.User{
		Email: email,
	}
	err := collection.FindOne(context.TODO(), &user1).Err()
	if err == nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Email already exists"))
		return
	}

	user2 := database.User{
		Username: username,
	}
	err = collection.FindOne(context.TODO(), &user2).Err()
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
		Username:  request.Username,
		Email:     request.Email,
		Password:  hashedPassword,
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
	}

	collection.InsertOne(context.TODO(), &new_account)
	w.WriteHeader(http.StatusOK)
}

func Login(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
	var request request.Signin
	_ = json.NewDecoder(r.Body).Decode(&request)
	collection := db.Collection("users")
	sessions := db.Collection("sessions")

	username := strings.TrimSpace(request.Username)
	password := strings.TrimSpace(request.Password)
	clientToken := strings.TrimSpace(request.ClientToken)

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

	user := database.User{
		Username: username,
	}
	err := collection.FindOne(context.TODO(), &user).Err()
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

	accessToken, err := GenerateJWT(user.ID.Hex())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to generate access token"))
		return
	}

	var session database.Session

	response := response.Signin_Response{
		AccessToken: accessToken,
		ClientToken: clientToken,
	}

	if clientToken != "" {
		err := sessions.FindOne(context.TODO(), bson.M{"client_token": clientToken}).Decode(&session)
		if err == nil {
			session.AccessToken = accessToken
			sessions.UpdateByID(context.TODO(), session.ID, &session)
			json.NewEncoder(w).Encode(response)
			return
		}
	}

	session = database.Session{
		AccessToken: accessToken,
		ClientToken: uuid.New().String(),
		AccountID:   user.ID,
	}
	collection.InsertOne(context.TODO(), &session)
	response.ClientToken = session.ClientToken
	json.NewEncoder(w).Encode(response)
}

func Logout(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
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

	collection := db.Collection("sessions")
	collection.DeleteOne(context.TODO(), bson.M{"_id": session.ID})
	w.WriteHeader(http.StatusOK)
}

func Signout(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
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

	collection := db.Collection("sessions")
	collection.DeleteOne(context.TODO(), bson.M{"_id": session.ID})
	w.WriteHeader(http.StatusOK)
}

func ChangePassword(ctx *Context) {
	var request request.ChangePassword
	_ = json.NewDecoder(ctx.Req.Body).Decode(&request)
	collection := ctx.Db.Collection("users")

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
	collection.UpdateOne(context.TODO(), bson.M{"_id": ctx.User.ID}, ctx.User)

	ctx.Res.WriteHeader(http.StatusOK)
}

func Refresh(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
	var request request.Refresh
	_ = json.NewDecoder(r.Body).Decode(&request)

	accessToken := strings.TrimSpace(request.AccessToken)
	clientToken := strings.TrimSpace(request.ClientToken)

	if accessToken == "" || clientToken == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var session database.Session
	collection := db.Collection("sessions")
	err := collection.FindOne(context.TODO(), bson.D{{"access_token", accessToken}}).Decode(&session)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Something went wrong"))
		return
	}

	id, err := ValidateJWT(request.AccessToken)
	if err == nil && session.AccountID.Hex() == id {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if err.Error() != "Token is expired" || session.ClientToken != request.ClientToken {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	newAccessToken, err := GenerateJWT(session.AccountID.Hex())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to generate access token"))
		return
	}

	session.AccessToken = newAccessToken
	collection.UpdateOne(context.TODO(), bson.M{"_id": session.ID}, session)

	response := response.Signin_Response{
		AccessToken: accessToken,
		ClientToken: request.ClientToken,
	}

	json.NewEncoder(w).Encode(response)
}

func ValidateAccessToken(AccessToken string, db *mongo.Database) (bool, database.Session) {
	id, err := ValidateJWT(AccessToken)
	if err != nil {
		return false, database.Session{}
	}
	session := database.Session{
		AccessToken: AccessToken,
	}
	collection := db.Collection("sessions")
	collection.FindOne(context.TODO(), bson.M{"access_token": AccessToken}).Decode(&session)

	if session.AccountID.Hex() == id {
		return true, session
	}
	return false, database.Session{}
}

func GenerateJWT(id string) (string, error) {
	secret_key := []byte(JWT_SECRET)
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	claims["id"] = id
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
		uuid := claims["id"].(string)
		return uuid, nil
	} else {
		return "", fmt.Errorf("Token is invalid")
	}
}
