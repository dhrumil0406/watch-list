import React, { useContext, useEffect } from 'react'
import { SymbolsContext } from '../Context/SymbolsContextProvider';
import { DropDownSymbolsContext } from '../Context/DropDwonSymbolsContextProvider';
import { AuthContext } from '../Context/AuthContextProvider';
import { DataContext } from '../Context/DataContextProvider';
import axios from 'axios';

const UserCradentials = ({ ws }) => {

    const { symbol, setSymbol, symbolsList, setSymbolsList } = useContext(SymbolsContext);
    const { setFilteredSymbols, setIsDropdownOpen, dropDownSymbols, setDropDownSymbols, isDropdownOpen, filteredSymbols } = useContext(DropDownSymbolsContext);
    const { userId, setUserId, password, setPassword, isWsConnect, setIsWsConnect, wsUrl, setWsUrl } = useContext(AuthContext);
    const { setTradeData } = useContext(DataContext);

    const fetchSymbolsfromAPI = async () => {
        try {
            const res = await axios.get('https://api.truedata.in/getAllSymbols?user=td134&password=dhrumil@134&segment=all');
            // console.log("Fetched Symbols: ", res.data.Records[0]);
            const symbols = res.data.Records.map(item => item[1]);
            setDropDownSymbols(symbols);
        } catch (error) {
            console.log("Error fetching symbols: ", error);
        }
    }

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

    const handleConnect = (e) => {
        e.preventDefault();
        if (isWsConnect === true) return
        const wsUrl = `wss://push.truedata.in:8082?user=${userId}&password=${password}`;
        ws.current = new WebSocket(wsUrl);
        ws.current.onopen = () => {
            console.log("WebSocket Connection Established");
        }
        ws.current.onmessage = (event) => {
            let response = JSON.parse(event.data);
            if (response.message === "TrueData Real Time Data Service") {
                console.log(response.message);
                setWsUrl(wsUrl);
                setIsWsConnect(true);
            } else if (response.message === 'Invalid User Credentials') {
                console.log(response.message);
            }
        }
    }

    const handleDisconnect = (e) => {
        e.preventDefault();
        setWsUrl("");
        setIsWsConnect(false);
        ws.current.onclose = (event) => {
            console.log("Closed");
        }

        return ws.current.close();
    }

    useEffect(() => {
        fetchSymbolsfromAPI();
    }, [])

    return (
        <div className="formBox bg-white shadow-md rounded-md p-4 mb-6">
            <div className="flex flex-auto gap-4 items-center justify-content">
                <div className='flex gap-4'>
                    <input
                        name="userid"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        type='text'
                        id='userid'
                        placeholder='Enter UserId'
                        className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    />

                    <input
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type='password'
                        id='password'
                        placeholder='Enter Password'
                        className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    />

                    <div>
                        <button
                            onClick={handleConnect}
                            type="button"
                            className={`bg-blue-600 text-white px-4 py-2 rounded  hover:bg-blue-700`}
                            disabled={isWsConnect}
                        >
                            Connect
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={handleDisconnect}
                            type="button"
                            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700`}
                            disabled={!isWsConnect}
                        >
                            Disconnect
                        </button>
                    </div>
                </div>

                <div>
                    <input
                        name="symbol"
                        value={symbol}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => { setIsDropdownOpen(true); }}
                        type="text"
                        id="symbol"
                        placeholder="Enter Symbol"
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        </div >
    )
}

export default UserCradentials
