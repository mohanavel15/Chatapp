package restapi

import (
	"Chatapp/database"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetAvatars(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
	vars := mux.Vars(r)
	user_id := vars["user_id"]
	avatar_id := vars["avatar_id"]
	filename := vars["filename"]

	user, statusCode := database.GetUser(user_id, db)
	if statusCode != http.StatusOK {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	avatar := user.Avatar
	if avatar_id != avatar.ID.Hex() {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if filename != fmt.Sprintf("unknown.%s", avatar.Ext) {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", avatar.Type)
	data := base64.NewDecoder(base64.StdEncoding, strings.NewReader(avatar.Avatar))
	io.Copy(w, data)
}

func GetIcons(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
	vars := mux.Vars(r)
	channel_id := vars["channel_id"]
	filename := vars["filename"]

	file_path := fmt.Sprintf("files/icons/%s/%s", channel_id, filename)

	_, err := os.Stat(file_path)
	if os.IsNotExist(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	http.ServeFile(w, r, file_path)
}

func GetAttachments(w http.ResponseWriter, r *http.Request, db *mongo.Database) {
	vars := mux.Vars(r)
	channel_id := vars["channel_id"]
	user_id := vars["user_id"]
	filename := vars["filename"]

	file_path := fmt.Sprintf("files/attachments/%s/%s/%s", channel_id, user_id, filename)

	_, err := os.Stat(file_path)
	if os.IsNotExist(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	http.ServeFile(w, r, file_path)
}
