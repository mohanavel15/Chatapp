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

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error
var handler *websocket.EventHandler

var queue = []*websocket.WS_Message{}
var onlineUsers = make(map[string]*websocket.Ws)
var channels = make(map[string]map[string]*websocket.Ws)

// Environment Variables
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
	dbUri := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable", PG_HOST, PG_PORT, PG_USER, PG_DATABASE, PG_PASSWORD)
	db, err = gorm.Open(postgres.Open(dbUri), &gorm.Config{})

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

	handler = &websocket.EventHandler{}
	handler.Add("CONNECT", gateway.Connect)

	handler.Add("CREATE_INVITE", gateway.CreateInvite)
	handler.Add("REMOVE_INVITE", gateway.RemoveInvite)

	handler.Add("MEMBER_JOIN", gateway.MemberJoin)
	handler.Add("MEMBER_REMOVE", gateway.MemberRemove)

	handler.Add("CHANNEL_JOIN", gateway.ChannelJoin)
	handler.Add("CHANNEL_CREATE", gateway.ChannelCreate)
	handler.Add("CHANNEL_MODIFY", gateway.ChannelModify)
	handler.Add("CHANNEL_DELETE", gateway.ChannelDelete)

	handler.Add("MESSAGE_CREATE", gateway.MessageCreate)
	handler.Add("MESSAGE_MODIFY", gateway.MessageModify)
	handler.Add("MESSAGE_DELETE", gateway.MessageDelete)

	router := mux.NewRouter()
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PATCH", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	// Auth
	router.HandleFunc("/signup", IncludeDB(restapi.Register)).Methods("POST")
	router.HandleFunc("/signin", IncludeDB(restapi.Login)).Methods("POST")
	router.HandleFunc("/logout", IncludeDB(restapi.Logout)).Methods("POST")
	router.HandleFunc("/signout", IncludeDB(restapi.Signout)).Methods("POST")
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
	// Members
	router.HandleFunc("/channels/{id}/members", Authenticated(restapi.GetMembers)).Methods("GET")
	router.HandleFunc("/channels/{id}/members/{mid}", Authenticated(restapi.GetMember)).Methods("GET")
	router.HandleFunc("/channels/{id}/members/{mid}", Authenticated(restapi.DeleteMember)).Methods("DELETE")
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

	// Gateway
	router.HandleFunc("/ws", Gateway)

	server_uri := fmt.Sprintf("%s:%s", HOST, PORT)
	log.Println(fmt.Sprintf("Listening on %s", server_uri))
	http.ListenAndServe(server_uri, handlers.CORS(headers, methods, origins)(router))
}
