package restapi

import (
	"Chatapp/database"
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetAvatars(w http.ResponseWriter, r *http.Request, db *database.Database) {
	vars := mux.Vars(r)
	user_id := vars["user_id"]
	avatar_id := vars["avatar_id"]
	filename := vars["filename"]

	user, statusCode := db.GetUser(user_id)
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

func GetIcons(w http.ResponseWriter, r *http.Request, db *database.Database) {
	vars := mux.Vars(r)
	channel_id := vars["channel_id"]
	icon_id := vars["icon_id"]
	filename := vars["filename"]

	channel, statusCode := db.GetChannelWithoutUser(channel_id)
	if statusCode != http.StatusOK {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	icon := channel.Icon
	if icon_id != icon.ID.Hex() {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if filename != fmt.Sprintf("unknown.%s", icon.Ext) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", icon.Type)
	data := base64.NewDecoder(base64.StdEncoding, strings.NewReader(icon.Icon))
	io.Copy(w, data)
}

func GetAttachments(w http.ResponseWriter, r *http.Request, db *database.Database) {
	vars := mux.Vars(r)
	channel_id := vars["channel_id"]
	message_id := vars["message_id"]
	attachment_id := vars["attachment_id"]
	filename := vars["filename"]

	channel_object_id, err := primitive.ObjectIDFromHex(channel_id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	message_oject_id, err := primitive.ObjectIDFromHex(message_id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var message database.Message
	messageCollection := db.Mongo.Collection("messages")
	err = messageCollection.FindOne(context.TODO(), bson.M{"_id": message_oject_id, "channel_id": channel_object_id}).Decode(&message)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	found := false
	for _, attachment := range message.Attachments {
		if attachment.ID.Hex() == attachment_id && attachment.Filename == filename {
			reader := bytes.NewReader(attachment.Data)
			w.Header().Set("Content-Type", attachment.ContentType)
			if AddDispositionHeader(attachment.ContentType) {
				w.Header().Set("Content-Disposition", "attachment")
			}
			io.Copy(w, reader)
			found = true
			break
		}
	}

	if !found {
		w.WriteHeader(http.StatusNotFound)
	}
}

func AddDispositionHeader(ContentType string) bool {
	is_image_regex := regexp.MustCompile(`image/.+`)
	is_image := is_image_regex.FindString(ContentType)

	is_video_regex := regexp.MustCompile(`video/.+`)
	is_video := is_video_regex.FindString(ContentType)

	is_audio_regex := regexp.MustCompile(`audio/.+`)
	is_audio := is_audio_regex.FindString(ContentType)

	if is_image != "" {
		return false
	} else if is_video != "" {
		return false
	} else if is_audio != "" {
		return false
	} else {
		return true
	}
}
