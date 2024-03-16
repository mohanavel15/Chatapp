package config

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

var C Config

type Config struct {
	HOST           string `json:"host"`
	PORT           uint16 `json:"port"`
	TLS            bool   `json:"tls"`
	PUBLIC_URL     string `json:"public_url"`
	PUBLIC_DIR     string `json:"public_dir"`
	JWT_SECRET     string `json:"jwt_secret"`
	MONGO_URI      string `json:"mongodb_uri"`
	MONGO_DATABASE string `json:"mongodb_databse"`
	SMTP_SERVER    string `json:"smtp_server"`
	SMTP_USERNAME  string `json:"smtp_username"`
	SMTP_PASSWORD  string `json:"password"`
}

func MakeDefaultConfig() Config {
	randBytes := make([]byte, 32)
	rand.Read(randBytes)
	jwt_secret := hex.EncodeToString(randBytes)

	return Config{
		HOST:           "0.0.0.0",
		PORT:           5000,
		TLS:            false,
		PUBLIC_URL:     "localhost:5000",
		PUBLIC_DIR:     "public",
		JWT_SECRET:     jwt_secret,
		MONGO_URI:      "mongodb://localhost:27017",
		MONGO_DATABASE: "chatdb",
		SMTP_SERVER:    "",
		SMTP_USERNAME:  "",
		SMTP_PASSWORD:  "",
	}
}

func LoadConfig() {
	file, err := os.Open("config.json")
	if err != nil {
		fmt.Println("Warn: config.json not found! Creating new one!")
		C = MakeDefaultConfig()
		file, err := os.Create("config.json")
		if err != nil {
			fmt.Println("Warn: Unable create config.json")
		}

		data, err := json.MarshalIndent(&C, "", "\t")
		if err != nil {
			fmt.Println("Warn: Unable to marshal json")
			return
		}

		_, err = file.Write(data)
		if err != nil {
			fmt.Println("Warn: Unable to write to config.json")
		}
		return
	}

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&C)
	if err != nil {
		log.Fatalln("Unable to parse config.json")
	}
}
