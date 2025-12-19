import React, { useContext } from 'react'
import { DataContext } from '../Context/DataContextProvider'
import { SymbolsContext } from '../Context/SymbolsContextProvider';

const DisplayData = ({ ws }) => {

    const { setSymbolsList, symbolColorMap } = useContext(SymbolsContext);
    const { touchlineData, setTouchlineData, tradeData, setTradeData, totalSubscribes } = useContext(DataContext);

    const tradeMap = React.useMemo(() => {
        const map = {};
        // stores the maped data when tradeData changes
        tradeData.forEach(tr => {
            map[tr[0]] = tr;
        });
        return map;
    }, [tradeData]);

    const handleUnsubscribe = (symbol) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                method: 'removesymbol',
                symbols: [symbol]
            }));

            const data = localStorage.getItem("SymbolList").split(',');
            const newData = data.filter((item) => item !== symbol);
            localStorage.setItem("SymbolList", newData);

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

    // useEffect(() => {
    //     console.log(touchOrTrade);
    // }, [touchOrTrade])

    // useEffect(() => {
    //     console.log("touchlineData: ", touchlineData);
    // }, [touchlineData]);

    return (
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
                                className={`text-center ${symbolColorMap[symbolId] || 'text-gray-600'}`}
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
    )
}

export default DisplayData
