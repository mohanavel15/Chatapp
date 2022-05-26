package restapi

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func GetAvatars(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user_id := vars["user_id"]
	filename := vars["filename"]

	file_path := fmt.Sprintf("files/avatars/%s/%s", user_id, filename)

	_, err := os.Stat(file_path)
	if os.IsNotExist(err) {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	http.ServeFile(w, r, file_path)
}

func GetIcons(w http.ResponseWriter, r *http.Request) {
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

func GetAttachments(w http.ResponseWriter, r *http.Request) {
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
