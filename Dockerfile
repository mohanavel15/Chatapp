FROM golang:1.17-alpine

RUN mkdir /server
ADD ./Chatapp /server
WORKDIR /server
RUN go build

CMD ["/app/Chatapp"]