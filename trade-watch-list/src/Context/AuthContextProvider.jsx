import React, { createContext, useState } from 'react'

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [wsUrl, setWsUrl] = useState("");
    const [isWsConnect, setIsWsConnect] = useState(() => {
        const stored = localStorage.getItem("WS_CONNECTED");
        return stored === "true";
    });

    return (

        <AuthContext.Provider value={{ userId, setUserId, password, setPassword, wsUrl, setWsUrl, isWsConnect, setIsWsConnect }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider
