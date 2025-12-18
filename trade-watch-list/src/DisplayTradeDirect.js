import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'

const DisplayTradeDirect = () => {
    var ws = useRef(null);

    const [symbol, setSymbol] = useState(""); // Input symbol to subscribe
    const [symbolsList, setSymbolsList] = useState([]); // List of subscribed symbols

    const [tradeData, setTradeData] = useState([]); // Array to hold trade data change when new trade comes
    const [touchlineData, setTouchlineData] = useState([]); // Array to hold touchline data stores when new symbol is subscribed

    const [symbolColorMap, setSymbolColorMap] = useState({}); // Map to hold symbol colors based on LTP changes

    const [totalSubscribes, setTotalSubscribes] = useState(0); // Total number of subscribed symbols

    const [touchOrTrade, setTouchOrTrade] = useState({}); // To toggle between touchline and trade data display
    const [dropDownSymbols, setDropDownSymbols] = useState([]); // All symbols fetched from API for dropdown
    const [filteredSymbols, setFilteredSymbols] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const webSocketUrl = "wss://push.truedata.in:8082?user=td134&password=dhrumil@134";


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

    const tradeMap = React.useMemo(() => {
        const map = {};
        // stores the maped data when tradeData changes
        tradeData.forEach(tr => {
            map[tr[0]] = tr;
        });
        return map;
    }, [tradeData]);

    const fetchSymbolsfromAPI = async () => {
        try {
            console.log("Fetching symbols from API...");

            const res = await axios.get('https://api.truedata.in/getAllSymbols?user=td134&password=dhrumil@134&segment=all');
            console.log("Fetched Symbols: ", res.data.Records[0]);
            const symbols = res.data.Records.map(item => item[1]);
            setDropDownSymbols(symbols);
        } catch (error) {
            console.log("Error fetching symbols: ", error);
        }
    }

    const handleSearch = (value) => {
        setSymbol(value.toUpperCase());

        if (!value) {
            setFilteredSymbols([]);
            return;
        }

        const filtered = dropDownSymbols
            .filter(sym =>
                sym.toUpperCase().includes(value.toUpperCase())
            )
            .slice(0, 20); // limit results

        setFilteredSymbols(filtered);
    };

    useEffect(() => {
        console.log(touchOrTrade);
    }, [touchOrTrade])

    useEffect(() => {
        console.log("touchlineData: ", touchlineData);
    }, [touchlineData]);

    useEffect(() => {
        fetchSymbolsfromAPI();

        ws.current = new WebSocket(webSocketUrl);
        ws.current.onopen = () => {
            console.log("WebSocket Connection Established");
        }

        ws.current.onmessage = (event) => {
            handleMessage(event)
        };

        ws.current.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        ws.current.onclose = () => {
            console.log("WebSocket Connection Closed");
        };

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubscribe = () => {
        if (!symbol) return;
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                method: 'addsymbol',
                symbols: [symbol.toUpperCase()]
            }));
            if (symbolsList.includes(symbol.toUpperCase())) return;
            setSymbolsList((prev) => [...prev, symbol.toUpperCase()]);
            // console.log(`Subscribed to symbol: ${symbol}`);
        }
    }

    const handleUnsubscribe = (symbol) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                method: 'removesymbol',
                symbols: [symbol]
            }));

            setSymbolsList((prev) => prev.filter((sym) => sym !== symbol));

            const symbolId = touchlineData.find(item => item[0] === symbol);

            setTradeData(prev =>
                prev.filter(item => item[0] !== symbolId[1])
            );

            setTouchlineData(prev =>
                prev.filter(item => item[0] !== symbol)
            );
            // console.log(`Unsubscribed from symbol: ${symbol}`);
        }
    }

    return (
        <div className="px-20 py-10 bg-gray-100 min-h-screen">
            <div className="formBox bg-white shadow-md rounded-md p-4 mb-6">
                <div className="flex gap-4 items-center justify-center">

                    <div>
                        <input
                            name="symbol"
                            value={symbol}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => { setIsDropdownOpen(true); }}
                            type="text"
                            id="symbol"
                            placeholder="Enter Symbol"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        {isDropdownOpen && filteredSymbols.length > 0 && (
                            <ul className="absolute z-50 w-60 bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
                                {filteredSymbols.map((sym, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            setSymbol(sym.toUpperCase());
                                            setIsDropdownOpen(false);
                                            handleSubscribe();
                                        }}
                                        className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                                    >
                                        {sym}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <button
                            onClick={handleSubscribe}
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Subscribe
                        </button>
                    </div>

                </div>
            </div>

            <div className="tableBox bg-white shadow-md rounded-md p-4">
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border py-2">ID</th>
                            <th className="border py-2">Symbol</th>
                            <th className="border py-2">LTP</th>
                            <th className="border py-2">ATP</th>
                            <th className="border py-2">Open</th>
                            <th className="border py-2">High</th>
                            <th className="border py-2">Low</th>
                            <th className="border py-2">PrevClose</th>
                            <th className="border py-2">Today_OI</th>
                            <th className="border py-2">Turnover</th>
                            <th className="border py-2">Bid</th>
                            <th className="border py-2">BidQty</th>
                            <th className="border py-2">Ask</th>
                            <th className="border py-2">AskQty</th>
                            <th className="border py-2">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* touchline data is comes first so display using touchline */}
                        {touchlineData.map((touch, index) => {
                            const symbol = touch[0];
                            const symbolId = touch[1];
                            const trade = tradeMap[symbolId];
                            const isTrade = !!trade;

                            return (
                                <tr
                                    key={symbolId}
                                    className={`text-center ${symbolColorMap[symbolId] || 'text-black-600'}`}
                                >
                                    <td className="border px-2 py-2">{symbolId}</td>
                                    <td className="border px-2 py-2">{symbol}</td>
                                    {isTrade ? (
                                        <>
                                            <td className="border px-2 py-2">{trade[2]}</td>
                                            <td className="border px-2 py-2">{trade[4]}</td>
                                            <td className="border px-2 py-2">{trade[6]}</td>
                                            <td className="border px-2 py-2">{trade[7]}</td>
                                            <td className="border px-2 py-2">{trade[8]}</td>
                                            <td className="border px-2 py-2">{trade[9]}</td>
                                            <td className="border px-2 py-2">{trade[10]}</td>
                                            <td className="border px-2 py-2">{trade[14]}</td>
                                            <td className="border px-2 py-2">{trade[15]}</td>
                                            <td className="border px-2 py-2">{trade[16]}</td>
                                            <td className="border px-2 py-2">{trade[17]}</td>
                                            <td className="border px-2 py-2">{trade[18]}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border px-2 py-2">{touch[3]}</td>
                                            <td className="border px-2 py-2">{touch[5]}</td>
                                            <td className="border px-2 py-2">{touch[7]}</td>
                                            <td className="border px-2 py-2">{touch[8]}</td>
                                            <td className="border px-2 py-2">{touch[9]}</td>
                                            <td className="border px-2 py-2">{touch[10]}</td>
                                            <td className="border px-2 py-2">{touch[11]}</td>
                                            <td className="border px-2 py-2">{touch[13]}</td>
                                            <td className="border px-2 py-2">{touch[14]}</td>
                                            <td className="border px-2 py-2">{touch[15]}</td>
                                            <td className="border px-2 py-2">{touch[16]}</td>
                                            <td className="border px-2 py-2">{touch[17]}</td>
                                        </>
                                    )}

                                    <td className="border px-2 py-2">
                                        <button
                                            onClick={() => handleUnsubscribe(symbol)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Unsubscribe
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className='mt-10 text-center'>Total Subscribed Symbols: {totalSubscribes}</div>
            </div>

        </div>
    )
}
export default DisplayTradeDirect


// {
//     <tbody>
//         {tradeData.map((trade, index) => (
//             touchOrTrade[trade[0]] === 'touchline' ? (
//                 <tr key={index} className={`text-center ${symbolColorMap[trade[0]] || 'text-black-600'}`}>
//                     <td className="border px-2 py-2">{touchlineData[index][1]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][0]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][3]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][5]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][7]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][8]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][9]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][10]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][11]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][13]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][14]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][15]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][16]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][17]}</td>
//                     <td className="border px-2 py-2">
//                         <button
//                             onClick={() => handleUnsubscribe(touchlineData[index][0])}
//                             type="button"
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                         >
//                             Unsubscribe
//                         </button>
//                     </td>
//                 </tr>
//             ) : (
//                 < tr key={index} className={`text-center ${symbolColorMap[trade[0]] || 'text-black-600'}`}>
//                     <td className="border px-2 py-2">{trade[0]}</td>
//                     <td className="border px-2 py-2">{touchlineData[index][0]}</td>
//                     <td className="border px-2 py-2">{trade[2]}</td>
//                     <td className="border px-2 py-2">{trade[4]}</td>
//                     <td className="border px-2 py-2">{trade[6]}</td>
//                     <td className="border px-2 py-2">{trade[7]}</td>
//                     <td className="border px-2 py-2">{trade[8]}</td>
//                     <td className="border px-2 py-2">{trade[9]}</td>
//                     <td className="border px-2 py-2">{trade[10]}</td>
//                     <td className="border px-2 py-2">{trade[14]}</td>
//                     <td className="border px-2 py-2">{trade[15]}</td>
//                     <td className="border px-2 py-2">{trade[16]}</td>
//                     <td className="border px-2 py-2">{trade[17]}</td>
//                     <td className="border px-2 py-2">{trade[18]}</td>
//                     <td className="border px-2 py-2">
//                         <button
//                             onClick={() => handleUnsubscribe(touchlineData[index][0])}
//                             type="button"
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                         >
//                             Unsubscribe
//                         </button>
//                     </td>
//                 </tr >
//             )
//         ))}
//     </tbody>
// }