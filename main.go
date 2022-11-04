package main

import (
	"Chatapp/pkg/database"
	"Chatapp/pkg/restapi"
	"Chatapp/pkg/websocket"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var db *database.Database
var handler *websocket.EventHandler

var conns = websocket.NewConnections()

var (
	HOST           = os.Getenv("SERVER_HOST")
	PORT           = os.Getenv("SERVER_PORT")
	MONGO_URI      = os.Getenv("MONGO_URI")
	MONGO_DATABASE = os.Getenv("MONGO_DATABASE")
)

func main() {
	db = database.NewDatabase(MONGO_URI, MONGO_DATABASE)

	handler = &websocket.EventHandler{}
	handler.Add("CONNECT", websocket.ConnectUser)

	router := mux.NewRouter()
	headers := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "PATCH", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	api := router.PathPrefix("/api").Subrouter()
	// Auth
	api.HandleFunc("/register", IncludeDB(restapi.Register)).Methods("POST")
	api.HandleFunc("/login", IncludeDB(restapi.Login)).Methods("POST")
	api.HandleFunc("/logout", Authenticated(restapi.Logout)).Methods("POST")
	api.HandleFunc("/changepassword", Authenticated(restapi.ChangePassword)).Methods("POST")
	// Channels
	api.HandleFunc("/channels/{id}", Authenticated(restapi.GetChannel)).Methods("GET")
	api.HandleFunc("/channels/{id}", Authenticated(restapi.EditChannel)).Methods("PATCH")
	api.HandleFunc("/channels/{id}", Authenticated(restapi.DeleteChannel)).Methods("DELETE")
	// Recipients
	api.HandleFunc("/channels/{id}/recipients/{uid}", Authenticated(restapi.AddRecipient)).Methods("PUT")
	api.HandleFunc("/channels/{id}/recipients/{uid}", Authenticated(restapi.RemoveRecipient)).Methods("DELETE")
	// Messages
	api.HandleFunc("/channels/{id}/messages", Authenticated(restapi.GetMessages)).Methods("GET")
	api.HandleFunc("/channels/{id}/messages", Authenticated(restapi.CreateMessage)).Methods("POST")
	api.HandleFunc("/channels/{id}/messages/{mid}", Authenticated(restapi.GetMessage)).Methods("GET")
	api.HandleFunc("/channels/{id}/messages/{mid}", Authenticated(restapi.EditMessage)).Methods("PATCH")
	api.HandleFunc("/channels/{id}/messages/{mid}", Authenticated(restapi.DeleteMessage)).Methods("DELETE")
	// Pin Messages
	api.HandleFunc("/channels/{id}/pins", Authenticated(restapi.GetPins)).Methods("GET")
	api.HandleFunc("/channels/{id}/pins/{mid}", Authenticated(restapi.PinMsg)).Methods("PUT")
	api.HandleFunc("/channels/{id}/pins/{mid}", Authenticated(restapi.UnpinMsg)).Methods("DELETE")
	// Invites
	api.HandleFunc("/invites/{id}", Authenticated(restapi.JoinInvite)).Methods("GET")
	api.HandleFunc("/channels/{id}/invites", Authenticated(restapi.GetInvites)).Methods("GET")
	api.HandleFunc("/channels/{id}/invites", Authenticated(restapi.CreateInvite)).Methods("POST")
	api.HandleFunc("/channels/{id}/invites/{iid}", Authenticated(restapi.DeleteInvite)).Methods("DELETE")
	// Bans
	api.HandleFunc("/channels/{id}/bans", Authenticated(restapi.GetAllBans)).Methods("GET")
	api.HandleFunc("/channels/{id}/bans/{bid}", Authenticated(restapi.GetBan)).Methods("GET")
	api.HandleFunc("/channels/{id}/bans/{bid}", Authenticated(restapi.DeleteBan)).Methods("DELETE")
	// Users
	api.HandleFunc("/users/@me", Authenticated(restapi.GetUser)).Methods("GET")
	api.HandleFunc("/users/@me", Authenticated(restapi.EditUser)).Methods("PATCH")
	api.HandleFunc("/users/@me/channels", Authenticated(restapi.GetChannels)).Methods("GET")
	api.HandleFunc("/users/@me/channels", Authenticated(restapi.CreateChannel)).Methods("POST")
	// Relationship
	api.HandleFunc("/users/@me/relationships", Authenticated(restapi.GetRelationships)).Methods("GET")
	api.HandleFunc("/users/@me/relationships/{rid}", Authenticated(restapi.GetRelationship)).Methods("GET")
	api.HandleFunc("/users/@me/relationships/{rid}/default", Authenticated(restapi.ChangeRelationshipToDefault)).Methods("PUT")
	api.HandleFunc("/users/@me/relationships/{rid}/friend", Authenticated(restapi.ChangeRelationshipToFriend)).Methods("PUT")
	api.HandleFunc("/users/@me/relationships/{rid}/block", Authenticated(restapi.ChangeRelationshipToBlock)).Methods("PUT")
	// Files
	api.HandleFunc("/avatars/{user_id}/{avatar_id}/{filename}", IncludeDB(restapi.GetAvatars)).Methods("GET")
	api.HandleFunc("/icons/{channel_id}/{icon_id}/{filename}", IncludeDB(restapi.GetIcons)).Methods("GET")
	api.HandleFunc("/attachments/{channel_id}/{message_id}/{attachment_id}/{filename}", IncludeDB(restapi.GetAttachments)).Methods("GET")
	// Gateway
	api.HandleFunc("/ws", Gateway)

	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("./web/dist/assets/"))))
	router.PathPrefix("/").HandlerFunc((func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "./web/dist/index.html") }))

	router.Use(handlers.CORS(headers, methods, origins))
	router.Use(handlers.RecoveryHandler())
	server_uri := fmt.Sprintf("%s:%s", HOST, PORT)
	log.Println("Listening on ", server_uri)

	server := http.Server{
		Addr:         server_uri,
		Handler:      router,
		ReadTimeout:  time.Second * 3,
		WriteTimeout: time.Second * 3,
		IdleTimeout:  time.Second * 3,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalln(err.Error())
	}
}
