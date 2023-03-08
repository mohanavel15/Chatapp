import React, { useState, createContext } from 'react'

export type ContextMenuType = {
    showCtxMenu: boolean,
    ctxMenu: JSX.Element | null,
    open: (ctx_menu: JSX.Element) => void
    close: () => void,
}

export const ContextMenu = createContext<ContextMenuType>(undefined!);

export default function ContextMenuProvider({ children }: {children: React.ReactChild}) {
	const [showCtxMenu, setShowCtxMenu] = useState(false);
	const [ctxMenu, setCtxMenu] = useState<JSX.Element | null>(null);

    function close() {
        setShowCtxMenu(false);
        setCtxMenu(null);
    }

    function open(ctx_menu: JSX.Element) {
        setCtxMenu(ctx_menu);
        setShowCtxMenu(true);
    }

    const context_value: ContextMenuType = {
        open: open,
        close: close,
        ctxMenu: ctxMenu,
		showCtxMenu: showCtxMenu,
    }

    return (
        <ContextMenu.Provider value={context_value} >
            {children}
        </ContextMenu.Provider>
    )
}
