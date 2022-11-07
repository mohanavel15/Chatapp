import { createContext, useState } from "react";

export type LoginContextOBJ = {
    error: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
    showError: boolean,
    setShowError: React.Dispatch<React.SetStateAction<boolean>>
}

export const LoginContext = createContext<LoginContextOBJ>(undefined!);

function LoginContextProvider({ children }: { children: React.ReactChild }) {
    const [error, setError] = useState<string>('');
	const [showError, setShowError] = useState<boolean>(false);

    const context_value: LoginContextOBJ = {
        error: error,
        setError: setError,
        showError: showError,
        setShowError: setShowError
    }
    
    return (
    <LoginContext.Provider value={context_value}>
        {children}
    </LoginContext.Provider>
    )
}

export default LoginContextProvider;