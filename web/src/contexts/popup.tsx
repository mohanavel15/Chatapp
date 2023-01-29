import { useState, createContext } from "react";

export interface PopUpContextOBJ {
    component: React.ReactChild | undefined
    setComponent: React.Dispatch<React.SetStateAction<React.ReactChild | undefined>>
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export const PopUpContext = createContext<PopUpContextOBJ>(undefined!);

export default function PopUpProvider({ children }: { children: React.ReactChild }) {
    const [component, setComponent] = useState<React.ReactChild>();
    const [show, setShow] = useState(false);

    const value: PopUpContextOBJ = {
        component,
        setComponent,
        show,
        setShow
    }

    return (
        <PopUpContext.Provider value={value}>
            {children}
        </PopUpContext.Provider>
    );
}