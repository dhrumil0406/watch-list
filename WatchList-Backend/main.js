const { rtConnect, rtSubscribe, rtUnsubscribe, rtFeed, historical, formatTime } = require('truedata-nodejs');

const user = "td134";
const pwd = "dhrumil@134";
const port = 8082;

const symbols = ['SILVER-I']; // symbols in array format

rtConnect(user, pwd, symbols, port, (bidask = 1), (heartbeat = 1));

rtFeed.on('touchline', touchlineHandler); // Receives Touchline Data
rtFeed.on('tick', tickHandler); // Receives Tick data
// rtFeed.on('greeks', greeksHandler); // Receives Greeks data
// rtFeed.on('bidask', bidaskHandler); // Receives Bid Ask data if enabled
// rtFeed.on('bidaskL2', bidaskL2Handler); // Receives level 2 Bid Ask data only for BSE exchange
// rtFeed.on('bar', barHandler); // Receives 1min and 5min bar data
// rtFeed.on('marketstatus', marketStatusHandler); // Receives marketstatus messages
// rtFeed.on('heartbeat', heartbeatHandler); // Receives heartbeat message and time

// returns data with bidask
function touchlineHandler(touchline) {
    console.log("TouchLine Data: ", touchline)
}

function tickHandler(tick) {
    console.log("Tick Data: ", tick)
}

function greeksHandler(greeks) {
    console.log("Greeks Data: ", greeks)
}

function bidaskHandler(bidask) {
    console.log("Bidas Data: ", bidask)
}

function bidaskL2Handler(bidaskL2) {
    console.log("BidasL2 Data: ", bidaskL2)
}

function barHandler(bar) {
    console.log("Bar Data: ", bar)
}

function marketStatusHandler(status) {
    console.log("Market Status Data: ", status);
}

function heartbeatHandler(heartbeat) {
    console.log("HeartBeat Data: ", heartbeat);
}

historical.auth(user, pwd); // For authentication.

from = formatTime(2025, 12, 15, 9, 15) // (year, month, date, hour, minute) // hour in 24 hour format
to = formatTime(2025, 12, 15, 23, 59) // (year, month, date, hour, minute) // hour in 24 hour format

// using from and to parameters
// historical
//     .getBarData('RELIANCE', from, to, interval = '30min', response = 'json', getSymbolId = 0)
//     .then((res) => console.log("Bar Data: ", res))
//     .catch((err) => console.log(err));

// historical data of 1D duration with 60min interval
// main display at client side
// historical
//     .getBarData('RELIANCE', duration = '1D', interval = '30min', response = 'json', getSymbolId = 0)
//     .then((res) => console.log("Bar Data: ", res))
//     .catch((err) => console.log(err));

// tick data per seconds of 1Day includes bidask
// historical
//     .getTickData('RELIANCE', duration = '1D', bidask = 1, response = 'json', getSymbolId = 0)
//     .then((res) => console.log("Tick Data: ", res))
//     .catch((err) => console.log(err));

// last N tick data per seconds includes bidask
// historical
//     .getLastNTicks('RELIANCE', nticks = 5, bidask = 1, response = 'json', getSymbolId = 0)
//     .then((res) => console.log("LastNTick: ", res))
//     .catch((err) => console.log(err));

// historical
//     .getBhavCopyStatus(segment = 'MCX', response = 'json')
//     .then((res) => console.log("Bhav Copy: ", res))
//     .catch((err) => console.log(err));

// return ltp data
// historical
//     .getLTP('RELIANCE', bidask = 1, response = 'json', getSymbolId = 0)
//     .then((res) => console.log("LTP: ", res))
//     .catch((err) => console.log(err));

// return top gainers data
// historical
//     .getTopGainers(topsegment = 'NSEEQ', top = 1, response = 'json')
//     .then((res) => console.log("Top Gainers: ", res))
//     .catch((err) => console.log(err));

// return top losers data
// historical
//     .getTopLosers(topsegment = 'NSEEQ', top = 1, reponse = 'json')
//     .then((res) => console.log("Top Losers: ", res))
//     .catch((err) => console.log(err));

// return top volume gainers
// historical
//     .getTopVolumeGainers(topsegment = 'NSEEQ', top = 1, response = 'json')
//     .then((res) => console.log("Top Volume Gainers: ", res))
//     .catch((err) => console.log(err));

// historical
//     .getCorpAction('RELIANCE', response = 'json')
//     .then((res) => console.log("Corp Actions: ", res))
//     .catch((err) => console.log(err));

// historical
//     .getSymbolNameChange(response = 'json')
//     .then((res) => console.log(res))
//     .catch((err) => console.log(err))



// Important:

// getTickData (symbol, from, to, bidask = 1, response = 'json', getSymbolId = 0)
// getBarData (symbol, from, to, interval = '1min', response = 'json', getSymbolId = 0)
// getLastNTicks (symbol, nticks = 2000, bidask = 1, response = 'json', getSymbolId = 0)
// getBhavCopyStatus (segment = 'FO', response = 'json')
// getBhavCopy (segment = 'FO', date, response = 'json')
// getLTP (symbol, bidask = 1, response = 'json', getSymbolId = 0)
// getTopGainers (topsegment = 'NSEFUT', top = 50, response = 'json')
// getTopLosers (topsegment = 'NSEFUT', top = 50, response = 'json')
// getTopVolumeGainers (topsegment = 'NSEFUT', top = 50, response = 'json')
// getCorpAction (symbol, response = 'json')
// getSymbolNameChange (response = 'json')

// symbol -> 'NIFTY-I', 'BANKNIFTY-I', 'TATATECH', 'RELIANCE'
// from, to OR duration -> from = formatTime(2021, 3, 2, 9, 15) , to = formatTime(2021, 3, 5, 9, 15), duration = '5D' [D,W,M,Y]
// bidask -> 0 (bidask feed inactive), 1 (bidask feed active)
// interval for bar data -> minutes = '1min', '5min', '15min', '30min', '60min'
// response -> 'json' or 'csv'
// getSymbolId -> 0 (for symbol name), 1 (for symbol id)

// nticks -> number of ticks to be fetched (max 2000) / MAX 5Day ticks
// nbars -> number of bars to be fetched (max 500) / MAX 5Day bars
// sengment -> 'FO' (Futures and Options), 'EQ' (Equity), 'MCX' (Commodity)
// topSegment -> 'NSEFUT' (Nifty Futures), 'NSEEQ' (Nifty Equity), 'MCX' (Commodity)
// top -> number of top records to be fetched (max 50)