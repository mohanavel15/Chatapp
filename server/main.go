package main

import (
	"Chatapp/database"
	"Chatapp/gateway"
	"Chatapp/restapi"
	"Chatapp/websocket"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB
var err error
var handler *websocket.EventHandler

var onlineUsers = make(map[string]*websocket.Ws)
var channels = make(map[string]map[string]*websocket.Ws)

var (
	HOST        = os.Getenv("SERVER_HOST")
	PORT        = os.Getenv("SERVER_PORT")
	PG_HOST     = os.Getenv("PG_HOST")
	PG_PORT     = os.Getenv("PG_PORT")
	PG_USER     = os.Getenv("PG_USER")
	PG_PASSWORD = os.Getenv("PG_PASSWORD")
	PG_DATABASE = os.Getenv("PG_DATABASE")
)

func main() {
	gorm_logger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Silent,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)

	dbUri := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", PG_HOST, PG_PORT, PG_USER, PG_DATABASE, PG_PASSWORD)
	db, err = gorm.Open(postgres.Open(dbUri), &gorm.Config{Logger: gorm_logger})

	if err != nil {
		log.Fatal(fmt.Sprintf("Failed to connect database: %s", err))
	} else {
		log.Println("Successfully connected database")
	}

	psql, err := db.DB()
	if err != nil {
		log.Fatal(fmt.Sprintf("Failed to get database connection: %s", err))
	}
	defer psql.Close()
	db.AutoMigrate(&database.Account{})
	db.AutoMigrate(&database.Session{})
	db.AutoMigrate(&database.Message{})
	db.AutoMigrate(&database.Channel{})
	db.AutoMigrate(&database.Member{})
	db.AutoMigrate(&database.Invites{})
	db.AutoMigrate(&database.Friend{})
	db.AutoMigrate(&database.Ban{})
	db.AutoMigrate(&database.Block{})
	db.AutoMigrate(&database.DMChannel{})
	db.AutoMigrate(&database.Pins{})

	handler = &websocket.EventHandler{}
	handler.Add("CONNECT", gateway.Connect)

	handler.Add("CHANNEL_CREATE", gateway.ChannelCreate)
	handler.Add("CHANNEL_MODIFY", gateway.ChannelModify)
	handler.Add("CHANNEL_DELETE", gateway.ChannelDelete)

	handler.Add("MESSAGE_CREATE", gateway.MessageCreate)
	handler.Add("MESSAGE_MODIFY", gateway.MessageModify)
	handler.Add("MESSAGE_DELETE", gateway.MessageDelete)

	router := mux.NewRouter()
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "PATCH", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	// Auth
	router.HandleFunc("/signup", IncludeDB(restapi.Register)).Methods("POST")
	router.HandleFunc("/signin", IncludeDB(restapi.Login)).Methods("POST")
	router.HandleFunc("/logout", IncludeDB(restapi.Logout)).Methods("POST")
	router.HandleFunc("/refresh", IncludeDB(restapi.Refresh)).Methods("POST")
	router.HandleFunc("/signout", IncludeDB(restapi.Signout)).Methods("POST")
	router.HandleFunc("/changepassword", Authenticated(restapi.ChangePassword)).Methods("POST")
	// Channels
	router.HandleFunc("/channels/{id}", Authenticated(restapi.GetChannel)).Methods("GET")
	router.HandleFunc("/channels/{id}", Authenticated(restapi.EditChannel)).Methods("PATCH")
	router.HandleFunc("/channels/{id}", Authenticated(restapi.DeleteChannel)).Methods("DELETE")
	// Messages
	router.HandleFunc("/channels/{id}/messages", Authenticated(restapi.GetMessages)).Methods("GET")
	router.HandleFunc("/channels/{id}/messages", Authenticated(restapi.CreateMessage)).Methods("POST")
	router.HandleFunc("/channels/{id}/messages/{mid}", Authenticated(restapi.GetMessage)).Methods("GET")
	router.HandleFunc("/channels/{id}/messages/{mid}", Authenticated(restapi.EditMessage)).Methods("PATCH")
	router.HandleFunc("/channels/{id}/messages/{mid}", Authenticated(restapi.DeleteMessage)).Methods("DELETE")
	// Pin Messages
	router.HandleFunc("/channels/{id}/pins", Authenticated(restapi.GetPins)).Methods("GET")
	router.HandleFunc("/channels/{id}/pins/{mid}", Authenticated(restapi.PinMsg)).Methods("PUT")
	router.HandleFunc("/channels/{id}/pins/{mid}", Authenticated(restapi.UnpinMsg)).Methods("DELETE")
	// Members
	router.HandleFunc("/channels/{id}/members", Authenticated(restapi.GetMembers)).Methods("GET")
	router.HandleFunc("/channels/{id}/members/{mid}", Authenticated(restapi.GetMember)).Methods("GET")
	router.HandleFunc("/channels/{id}/members/{mid}", Authenticated(restapi.DeleteMember)).Methods("DELETE")
	//Bans
	router.HandleFunc("/channels/{id}/bans", Authenticated(restapi.GetAllBans)).Methods("GET")
	router.HandleFunc("/channels/{id}/bans/{bid}", Authenticated(restapi.GetBan)).Methods("GET")
	router.HandleFunc("/channels/{id}/bans/{bid}", Authenticated(restapi.DeleteBan)).Methods("DELETE")
	// Invites
	router.HandleFunc("/invites/{id}", Authenticated(restapi.JoinInvite)).Methods("GET")
	router.HandleFunc("/channels/{id}/invites", Authenticated(restapi.GetInvites)).Methods("GET")
	router.HandleFunc("/channels/{id}/invites", Authenticated(restapi.CreateInvite)).Methods("POST")
	router.HandleFunc("/channels/{id}/invites/{iid}", Authenticated(restapi.DeleteInvite)).Methods("DELETE")
	// Users
	router.HandleFunc("/users/@me", Authenticated(restapi.GetUser)).Methods("GET")
	router.HandleFunc("/users/@me", Authenticated(restapi.EditUser)).Methods("PATCH")
	router.HandleFunc("/users/@me/channels", Authenticated(restapi.GetChannels)).Methods("GET")
	router.HandleFunc("/users/@me/channels", Authenticated(restapi.CreateChannel)).Methods("POST")
	// Friends
	router.HandleFunc("/users/@me/friends", Authenticated(restapi.GetFriends)).Methods("GET")
	router.HandleFunc("/users/@me/friends", Authenticated(restapi.AddOrAcceptFriend)).Methods("POST")
	router.HandleFunc("/users/@me/friends/{fid}", Authenticated(restapi.GetFriend)).Methods("GET")
	router.HandleFunc("/users/@me/friends/{fid}", Authenticated(restapi.RemoveOrDeclineFriend)).Methods("DELETE")
	// Blocks
	router.HandleFunc("/users/@me/blocks", Authenticated(restapi.GetBlocks)).Methods("GET")
	router.HandleFunc("/users/@me/blocks", Authenticated(restapi.AddBlock)).Methods("POST")
	router.HandleFunc("/users/@me/blocks/{bid}", Authenticated(restapi.DeleteBlock)).Methods("DELETE")
	// DMS
	router.HandleFunc("/users/@me/dms", Authenticated(restapi.GetDMChannels)).Methods("GET")
	router.HandleFunc("/dms/{id}", Authenticated(restapi.GetDMChannel)).Methods("GET")
	// Gateway
	router.HandleFunc("/ws", Gateway)

	server_uri := fmt.Sprintf("%s:%s", HOST, PORT)
	log.Println(fmt.Sprintf("Listening on %s", server_uri))
	http.ListenAndServe(server_uri, handlers.CORS(headers, methods, origins)(router))
}
