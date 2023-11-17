package utils

import (
	"Chatapp/pkg/database"
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var JWT_SECRET = os.Getenv("JWT_SECRET")

func GenerateJWT(id, use string) (string, error) {
	secret_key := []byte(JWT_SECRET)
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)

	claims["id"] = id
	claims["use"] = use
	claims["iat"] = time.Now().Unix()
	if use == "reset" {
		claims["exp"] = time.Now().Add(time.Minute * 30).Unix()
	} else {
		claims["exp"] = time.Now().Unix() * 2
	}

	tokenString, err := token.SignedString(secret_key)

	if err != nil {
		log.Fatal("Couldn't sign the token:", err)
		return "", err
	}
	return tokenString, nil
}

func ValidateAccessToken(AccessToken string, db *mongo.Database) (bool, database.User) {
	valid, use, user := ValidateToken(AccessToken, db)
	if use != "auth" {
		return false, user
	}

	return valid, user
}

func ValidateResetToken(AccessToken string, db *mongo.Database) (bool, database.User) {
	valid, use, user := ValidateToken(AccessToken, db)
	if use != "reset" {
		return false, user
	}

	return valid, user
}

func ValidateToken(AccessToken string, db *mongo.Database) (bool, string, database.User) {
	var user database.User

	claims, err := ValidateJWT(AccessToken)
	if err != nil {
		return false, "", user
	}

	use := claims["use"].(string)

	collection := db.Collection("users")
	id, err := primitive.ObjectIDFromHex(claims["id"].(string))
	if err != nil {
		return false, use, user
	}

	err = collection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)

	if err != nil {
		return false, use, user
	}

	iat := int64(claims["iat"].(float64))

	if user.LastLogout >= iat {
		return false, use, user
	}

	return true, use, user
}

func ValidateJWT(tokenString string) (jwt.MapClaims, error) {
	secret_key := []byte(JWT_SECRET)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("there was an error")
		}
		return secret_key, nil
	})

	if err != nil {
		return jwt.MapClaims{}, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	} else {
		return jwt.MapClaims{}, fmt.Errorf("token is invalid")
	}
}
