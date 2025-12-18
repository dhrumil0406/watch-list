import React, { useContext, useEffect, useRef } from 'react'
import { SymbolsContext } from './Context/SymbolsContextProvider';
import { DataContext } from './Context/DataContextProvider';
import UserCradentials from './Components/UserCradentials';
import DisplayData from './Components/DisplayData';
import { AuthContext } from './Context/AuthContextProvider';

const DisplayTradeDirect = () => {
    var ws = useRef(null);

    const { setSymbolColorMap } = useContext(SymbolsContext);
    const { setTradeData, setTouchlineData, setTotalSubscribes, touchOrTrade, setTouchOrTrade } = useContext(DataContext);
    const { wsUrl } = useContext(AuthContext);

    // const webSocketUrl = "wss://push.truedata.in:8082?user=td134&password=dhrumil@134";

    const handleMessage = async (event) => {
        let response;
        response = JSON.parse(event.data);
        console.log("Response: ", response); // returnes object
        const newSymbollist = response.symbollist ? response.symbollist[0] : null;

        if (response.message === "symbols added") {
            setTouchlineData(prev => [...prev, newSymbollist]);
            setTouchOrTrade({ ...touchOrTrade, [newSymbollist[1]]: 'touchline' });
            setTotalSubscribes(response.totalsymbolsubscribed);
            console.log("message: ", response.message);
        }

        if (response.message === "symbols removed") {
            setTotalSubscribes(response.totalsymbolsubscribed);
            console.log("message: ", response.message);
        }

        if (response.trade) {
            const trade = response.trade;
            const ltp = parseFloat(trade[2]);

            setTradeData((prev) => {
                // already existing symbol trade data update
                const existingIndex = prev.findIndex(td => td[0] === trade[0]);
                if (existingIndex !== -1) {
                    const updatedData = [...prev];
                    const prevLtp = parseFloat(prev[existingIndex][2]);

                    updatedData[existingIndex] = trade;
                    //  Update color ONLY for this symbol based on LTP comparison
                    setSymbolColorMap((prevColors) => ({
                        ...prevColors, [trade[0]]: ltp > prevLtp ? "bg-green-700 text-white" : ltp < prevLtp ? "bg-red-700 text-white" : "text-black-600",
                    }));
                    setTouchOrTrade({ ...touchOrTrade, [trade[0]]: 'trade' });
                    return updatedData;
                }

                // New symbol trade data add
                return [...prev, trade];
            });
        }
    };

    // useEffect(() => {
    //     console.log(touchOrTrade);
    // }, [touchOrTrade])

    // useEffect(() => {
    //     console.log("touchlineData: ", touchlineData);
    // }, [touchlineData]);

    useEffect(() => {
        ws.current = new WebSocket(wsUrl);
        console.log("Url: ", wsUrl);

        ws.current.onmessage = (event) => {
            handleMessage(event)
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };
    }, [wsUrl]);

    return (
        <div className="px-20 py-10 bg-gray-100 min-h-screen">
            <UserCradentials ws={ws} />
            <DisplayData ws={ws} />
        </div>
    )
}
export default DisplayTradeDirect