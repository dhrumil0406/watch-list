import React, { createContext, useState } from 'react'

export const DataContext = createContext();

const DataContextProvider = ({ children }) => {
    const [tradeData, setTradeData] = useState([]); // Array to hold trade data change when new trade comes
    const [touchlineData, setTouchlineData] = useState([]); // Array to hold touchline data stores when new symbol is subscribed
    const [totalSubscribes, setTotalSubscribes] = useState(0); // Total number of subscribed symbols
    const [touchOrTrade, setTouchOrTrade] = useState({}); // To toggle between touchline and trade data display

    return (
        <DataContext.Provider value={{ tradeData, setTradeData, touchlineData, setTouchlineData, totalSubscribes, setTotalSubscribes, touchOrTrade, setTouchOrTrade }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContextProvider
