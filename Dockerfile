FROM node:latest AS nodebuild

WORKDIR /web
COPY web .
RUN rm  -rf node_modules dist
RUN npm install
RUN npm run build

FROM golang:1.17-alpine

WORKDIR /server
COPY . .
COPY --from=nodebuild /web/dist/ /server/web/dist
RUN go build

CMD ["/server/Chatapp"]