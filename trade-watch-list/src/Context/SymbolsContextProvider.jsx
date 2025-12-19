import React, { createContext, useState } from 'react'

export const SymbolsContext = createContext();

const SymbolsContextProvider = ({ children }) => {
    const [symbol, setSymbol] = useState(""); // Input symbol to subscribe
    let defaultData = ['TCS', 'RELIANCE'];
    const data = localStorage.getItem("SymbolList").split(',');
    // console.log(data);

    const checkExist = data.includes(defaultData[0]) && data.includes(defaultData[1]);
    // console.log(checkExist);
    checkExist ? localStorage.setItem("SymbolList", data) : localStorage.setItem("SymbolList", [defaultData, data])

    const [symbolsList, setSymbolsList] = useState([data]); // List of subscribed symbols
    const [symbolColorMap, setSymbolColorMap] = useState({});

    return (
        <SymbolsContext.Provider value={{ symbol, setSymbol, symbolsList, setSymbolsList, symbolColorMap, setSymbolColorMap }}>
            {children}
        </SymbolsContext.Provider>
    )
}

export default SymbolsContextProvider
