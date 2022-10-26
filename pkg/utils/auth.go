package utils

import (
	"Chatapp/database"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var JWT_SECRET = os.Getenv("JWT_SECRET")

func GenerateJWT(id string) (string, error) {
	secret_key := []byte(JWT_SECRET)
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	claims["id"] = id
	claims["iat"] = time.Now().Unix()
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	tokenString, err := token.SignedString(secret_key)

	if err != nil {
		log.Fatal("Couldn't sign the token:", err)
		return "", err
	}
	return tokenString, nil
}

func ValidateAccessToken(AccessToken string, db *mongo.Database) (bool, database.Session) {
	id, err := ValidateJWT(AccessToken)
	if err != nil {
		return false, database.Session{}
	}

	var session database.Session
	collection := db.Collection("sessions")
	err = collection.FindOne(context.TODO(), bson.M{"access_token": AccessToken}).Decode(&session)

	if err != nil {
		return false, database.Session{}
	}

	if session.AccountID.Hex() != id {
		return false, database.Session{}
	}

	return true, session
}

func ValidateJWT(tokenString string) (string, error) {
	secret_key := []byte(JWT_SECRET)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("there was an error")
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
		return "", fmt.Errorf("token is invalid")
	}
}
