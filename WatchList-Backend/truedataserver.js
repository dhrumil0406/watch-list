const { rtConnect, rtSubscribe, rtUnsubscribe, rtFeed } = require('truedata-nodejs');
const { broadcast } = require('./wsServer');

const user = "td134";
const pwd = "dhrumil@134";
const port = 8082;

let symbols = [];

rtConnect(user, pwd, symbols, port, (bidask = 1), (heartbeat = 1));

rtFeed.on('touchline', (data) => {
    Object.values(data).forEach((tick) => {
        if (!tick.Symbol) return;

        const message = ({
            type: "touchline",
            payload: {
                Symbol: tick.Symbol,
                Symbol_ID: tick.Symbol_ID ?? 0,
                LastUpdateTime: tick.LastUpdateTime,
                LTP: tick.LTP ?? 0,
                // TickVolume: tick.TickVolume ?? 0,
                ATP: tick.ATP ?? 0,
                TotalVolume: tick.TotalVolume ?? 0,
                Open: tick.Open ?? 0,
                High: tick.High ?? 0,
                Low: tick.Low ?? 0,
                Previous_Close: tick.Previous_Close ?? 0,
                Today_OI: tick.Today_OI ?? 0,
                Previous_Open_Interest_Close: tick.Previous_Open_Interest_Close ?? 0,
                Turnover: tick.Turnover ?? 0,
                Bid: tick.Bid ?? 0,
                BidQty: tick.BidQty ?? 0,
                Ask: tick.Ask ?? 0,
                AskQty: tick.AskQty ?? 0
            }
        });

        broadcast(message);
    });
});

rtFeed.on('tick', (data) => {
    Object.values(data).forEach((tick) => {
        if (!tick[0]) return;

        const message = {
            type: 'trade',
            payload: {
                Symbol: data.Symbol,
                LastUpdateTime: data.Timestamp,
                LTP: data.LTP,
                ATP: data.ATP,
                TotalVolume: data.Volume,
                Open: data.Open,
                High: data.High,
                Low: data.Low,
                Previous_Close: data.Prev_Close,
                Today_OI: data.OI,
                Previous_Open_Interest_Close: data.Prev_open_Int_Close,
                Turnover: data.Day_Turnover,
                Bid: data.Bid,
                BidQty: data.Bid_Qty,
                Ask: data.Ask,
                AskQty: data.Ask_Qty
            }
        };

        broadcast(message);
    });
});


const dynamicSubscribeSymbol = (symbol) => {
    try {
        if (!symbols.includes(symbol)) {
            rtSubscribe([symbol]);
            symbols.push(symbol);
            return JSON.stringify({ status: 'success', message: `Subscribed to ${symbol}` });
        } else {
            return JSON.stringify({ status: 'error', message: `${symbol} is already subscribed` });
        }
    } catch (error) {
        return JSON.stringify({ status: 'error', message: error.message });
    }
}

const dynamicUnsubscribeSymbol = (symbol) => {
    try {
        const index = symbols.indexOf(symbol);
        if (index !== -1) {
            rtUnsubscribe([symbol]);
            symbols.splice(index, 1); // ✅ mutate array
            console.log("Current symbols:", symbols);
            return JSON.stringify({ status: 'success', message: `Unsubscribed from ${symbol}` });
        } else {
            return JSON.stringify({ status: 'error', message: `${symbol} is not subscribed` });
        }

    } catch (error) {
        return JSON.stringify({ status: 'error', message: error.message });
    }
}

module.exports = {
    dynamicSubscribeSymbol,
    dynamicUnsubscribeSymbol
};