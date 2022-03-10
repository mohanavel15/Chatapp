package websocket

type Function func(*Context)

type EventHandler struct {
	HandleFunc map[string]Function
}

func (eh *EventHandler) Handle(ctx Context) {
	if handler, ok := eh.HandleFunc[ctx.Event]; ok {
		handler(&ctx)
	}
}

func (eh *EventHandler) Add(event string, handler Function) {
	if eh.HandleFunc == nil {
		eh.HandleFunc = make(map[string]Function)
	}
	eh.HandleFunc[event] = handler
}
