import React, { createContext, useState } from 'react'

export const SymbolsContext = createContext();

const SymbolsContextProvider = ({children}) => {
    const [symbol, setSymbol] = useState(""); // Input symbol to subscribe
    const [symbolsList, setSymbolsList] = useState([]); // List of subscribed symbols
    const [symbolColorMap, setSymbolColorMap] = useState({});

    return (
        <SymbolsContext.Provider value={{ symbol, setSymbol, symbolsList, setSymbolsList, symbolColorMap, setSymbolColorMap }}>
            {children}
        </SymbolsContext.Provider>
    )
}

export default SymbolsContextProvider
