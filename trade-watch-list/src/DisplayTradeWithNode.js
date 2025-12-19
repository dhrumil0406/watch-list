import React, { useEffect, useState } from 'react'
import axios from 'axios';

const DisplayTradeWithNode = () => {

    const [touchlineData, setTouchlineData] = useState({});
    const [tradeData, setTradeData] = useState({});
    const [symbol, setSymbol] = useState("");

    const displayData = Object.values({
        ...touchlineData, // base
        ...tradeData      // overwrite with trade if exists
    });

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000");

        ws.onopen = () => {
            console.log("WebSocket Connected");
        };

        ws.onerror = (err) => {
            console.error("WebSocket Error:", err);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            // console.log(message);

            if (message.type === "touchline") {
                const data = message.payload;
                console.log("touchline: ", data);

                setTouchlineData(prev => ({
                    ...prev,
                    [data.Symbol]: data
                }));
            }

            if (message.type === "trade") {
                const data = message.payload;
                console.log("trade ", data);

                setTradeData(prev => ({
                    ...prev,
                    [data.Symbol]: data
                }));
            }



            // setTradeData(prev => {
            //     const index = prev.findIndex(trade => trade.Symbol === data.Symbol);
            //     if (index !== -1) {
            //         const updated = [...prev];
            //         updated[index] = data;
            //         return updated;
            //     }
            //     return [...prev, data];
            // });
        };

        return () => ws.close();
    }, []);

    const handleSubscribe = () => {
        axios.get(`http://localhost:8080/subscribeSymbol/${symbol}`)
            .then(response => {
                setSymbol('');
                console.log(`Subscribe Response: ${response.data.message}`);
            })
            .catch(error => {
                console.error(`Subscribe Error: ${error.message}`);
            });
    }

    const handleUnsubscribe = (symbol) => {
        axios.get(`http://localhost:8080/unsubscribeSymbol/${symbol}`)
            .then(response => {
                // setTradeData(prev => prev.filter(trade => trade.Symbol !== symbol));
                setTradeData(prev => {
                    const updated = { ...prev };
                    delete updated[symbol];
                    return updated;
                });

                setTouchlineData(prev => {
                    const updated = { ...prev };
                    delete updated[symbol];
                    return updated;
                });
                console.log(`Unsubscribe Response: ${response.data.message}`);
            })
            .catch(error => {
                console.log(`Unsubscribe Error: ${error.message}`);
            });
    }

    return (
        <div className="px-40 py-10 bg-gray-100 min-h-screen">
            <div className="formBox bg-white shadow-md rounded-md p-4 mb-6">
                <div className="flex gap-4 items-center justify-center">

                    <div>
                        <input
                            onChange={(e) => setSymbol(e.target.value)}
                            type="text"
                            name="symbol"
                            id="symbol"
                            placeholder="Enter Symbol"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
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

                    <div>
                        <button
                            type="button"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Fetch History
                        </button>
                    </div>

                </div>
            </div>

            <div className="tableBox bg-white shadow-md rounded-md p-4">
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-2">Symbol</th>
                            <th className="border px-2 py-2">LTP</th>
                            <th className="border px-2 py-2">Open</th>
                            <th className="border px-2 py-2">High</th>
                            <th className="border px-2 py-2">Low</th>
                            <th className="border px-2 py-2">PrevClose</th>
                            <th className="border px-2 py-2">Today_OI</th>
                            <th className="border px-2 py-2">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayData.map((trade, index) => (
                            <tr key={index} className="text-center hover:bg-gray-50">
                                {console.log(trade)}
                                <td className="border px-2 py-2">{trade.Symbol}</td>
                                <td className="border px-2 py-2">{trade.LTP}</td>
                                <td className="border px-2 py-2">{trade.Open}</td>
                                <td className="border px-2 py-2">{trade.High}</td>
                                <td className="border px-2 py-2">{trade.Low}</td>
                                <td className="border px-2 py-2">{trade.Previous_Close}</td>
                                <td className="border px-2 py-2">{trade.Today_OI}</td>
                                <td className="border px-2 py-2">
                                    <button
                                        onClick={() => handleUnsubscribe(trade.Symbol)}
                                        type="button"
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Unsubscribe
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default DisplayTradeWithNode
