all:
	make build

build:
	go build
	mkdir -p build
	mv Chatapp build/

run:
	'source .env'
	./build/Chatapp

clean:
	rm -rf build