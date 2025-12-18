const express = require('express');
const cors = require('cors');
const { dynamicSubscribeSymbol, dynamicUnsubscribeSymbol } = require('./truedataserver');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get('/subscribeSymbol/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const data = await dynamicSubscribeSymbol(symbol);

    const stringData = JSON.parse(data);
    if (stringData.status === 'success') {
        res.json({ status: 'success', message: `Subscribed to ${symbol}` });
    } else if (stringData.status === 'error') {
        res.json({ status: 'error', message: `${symbol} is already subscribed` });
    }
});

app.get('/unsubscribeSymbol/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const data = await dynamicUnsubscribeSymbol(symbol);

    const stringData = JSON.parse(data);
    if (stringData.status === 'success') {
        res.json({ status: 'success', message: `Unsubscribed from ${symbol}` });
    } else if (stringData.status === 'error') {
        res.json({ status: 'error', message: `${symbol} is not subscribed` });
    }
});

app.listen(port, () => {
    console.log(`Express running on http://localhost:${port}`);
});