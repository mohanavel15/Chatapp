package mail

import (
	"fmt"
	"net/smtp"
)

var mailsystem *MailSystem

type MailSystem struct {
	server   string
	username string
	auth     *smtp.Auth
}

func SendMail(recipient, subject, body string) error {
	if mailsystem == nil {
		return fmt.Errorf("use of SMTP without initialization")
	}

	m := mailsystem

	message := []byte("From:" + m.username +
		"\r\nTo: " + recipient + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" + body + "\r\n")

	return smtp.SendMail(m.server+":587", *m.auth, m.username, []string{recipient}, message)
}

func NewMailSystem(server, username, password string) {
	auth := smtp.PlainAuth("", username, password, server)
	mailsystem = &MailSystem{
		server:   server,
		username: username,
		auth:     &auth,
	}
}
