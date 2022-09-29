package websocket

import "sync"

type Function func(*Context)

type EventHandler struct {
	mutex      sync.Mutex
	HandleFunc map[string]Function
}

func (eh *EventHandler) Handle(ctx Context) {
	eh.mutex.Lock()
	if handler, ok := eh.HandleFunc[ctx.Event]; ok {
		eh.mutex.Unlock()
		handler(&ctx)
	}
	eh.mutex.Unlock()
}

func (eh *EventHandler) Add(event string, handler Function) {
	eh.mutex.Lock()
	if eh.HandleFunc == nil {
		eh.HandleFunc = make(map[string]Function)
	}
	eh.HandleFunc[event] = handler
	eh.mutex.Unlock()
}
