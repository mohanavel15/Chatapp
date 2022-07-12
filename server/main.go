package main

import (
	"Chatapp/restapi"
	"Chatapp/websocket"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db *mongo.Database
var handler *websocket.EventHandler

var onlineUsers = make(map[string]*websocket.Ws)
var channels = make(map[string]map[string]*websocket.Ws)

var (
	HOST           = os.Getenv("SERVER_HOST")
	PORT           = os.Getenv("SERVER_PORT")
	MONGO_URI      = os.Getenv("MONGO_URI")
	MONGO_DATABASE = os.Getenv("MONGO_DATABASE")
)

func main() {
	clientOptions := options.Client().ApplyURI(MONGO_URI)
	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatalf("Failed to connect database: %s", err)
	} else {
		log.Println("Successfully connected database")
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatalf("Failed to ping database: %s", err)
	}

	db = client.Database(MONGO_DATABASE)

	handler = &websocket.EventHandler{}
	handler.Add("CONNECT", websocket.ConnectUser)

	router := mux.NewRouter()
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "PATCH", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	// Auth
	router.HandleFunc("/register", IncludeDB(restapi.Register)).Methods("POST")
	router.HandleFunc("/login", IncludeDB(restapi.Login)).Methods("POST")
	router.HandleFunc("/logout", IncludeDB(restapi.Logout)).Methods("POST")
	router.HandleFunc("/refresh", IncludeDB(restapi.Refresh)).Methods("POST")
	router.HandleFunc("/signout", IncludeDB(restapi.Signout)).Methods("POST")
	router.HandleFunc("/changepassword", Authenticated(restapi.ChangePassword)).Methods("POST")
	// Channels
	router.HandleFunc("/channels/{id}", Authenticated(restapi.GetChannel)).Methods("GET")
	router.HandleFunc("/channels/{id}", Authenticated(restapi.EditChannel)).Methods("PATCH")
	router.HandleFunc("/channels/{id}", Authenticated(restapi.DeleteChannel)).Methods("DELETE")
	// Recipients
	router.HandleFunc("/channels/{id}/recipients/{uid}", Authenticated(restapi.AddRecipient)).Methods("PUT")
	router.HandleFunc("/channels/{id}/recipients/{uid}", Authenticated(restapi.RemoveRecipient)).Methods("DELETE")
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
	// Invites
	router.HandleFunc("/invites/{id}", Authenticated(restapi.JoinInvite)).Methods("GET")
	router.HandleFunc("/channels/{id}/invites", Authenticated(restapi.GetInvites)).Methods("GET")
	router.HandleFunc("/channels/{id}/invites", Authenticated(restapi.CreateInvite)).Methods("POST")
	router.HandleFunc("/channels/{id}/invites/{iid}", Authenticated(restapi.DeleteInvite)).Methods("DELETE")
	// Bans
	router.HandleFunc("/channels/{id}/bans", Authenticated(restapi.GetAllBans)).Methods("GET")
	router.HandleFunc("/channels/{id}/bans/{bid}", Authenticated(restapi.GetBan)).Methods("GET")
	router.HandleFunc("/channels/{id}/bans/{bid}", Authenticated(restapi.DeleteBan)).Methods("DELETE")
	// Users
	router.HandleFunc("/users/@me", Authenticated(restapi.GetUser)).Methods("GET")
	router.HandleFunc("/users/@me", Authenticated(restapi.EditUser)).Methods("PATCH")
	router.HandleFunc("/users/@me/channels", Authenticated(restapi.GetChannels)).Methods("GET")
	router.HandleFunc("/users/@me/channels", Authenticated(restapi.CreateChannel)).Methods("POST")
	// Relationship
	router.HandleFunc("/users/@me/relationships", Authenticated(restapi.GetRelationships)).Methods("GET")
	router.HandleFunc("/users/@me/relationships/{rid}", Authenticated(restapi.GetRelationship)).Methods("GET")
	router.HandleFunc("/users/@me/relationships/{rid}/default", Authenticated(restapi.ChangeRelationshipToDefault)).Methods("PUT")
	router.HandleFunc("/users/@me/relationships/{rid}/friend", Authenticated(restapi.ChangeRelationshipToFriend)).Methods("PUT")
	router.HandleFunc("/users/@me/relationships/{rid}/block", Authenticated(restapi.ChangeRelationshipToBlock)).Methods("PUT")
	// Gateway
	router.HandleFunc("/ws", Gateway)
	// Files
	router.HandleFunc("/avatars/{user_id}/{avatar_id}/{filename}", IncludeDB(restapi.GetAvatars)).Methods("GET")
	router.HandleFunc("/icons/{channel_id}/{icon_id}/{filename}", IncludeDB(restapi.GetIcons)).Methods("GET")
	router.HandleFunc("/attachments/{channel_id}/{message_id}/{attachment_id}/{filename}", IncludeDB(restapi.GetAttachments)).Methods("GET")

	after_cors := handlers.CORS(headers, methods, origins)(router)
	after_recovery := handlers.RecoveryHandler()(after_cors)

	server_uri := fmt.Sprintf("%s:%s", HOST, PORT)
	log.Printf("Listening on %s", server_uri)
	http.ListenAndServe(server_uri, after_recovery)
}
