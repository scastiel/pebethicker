var UI = require('ui');
var Settings = require('settings');
var ajax = require('ajax');

var PRESS_SELECT_TO_REFRESH_TEXT = 'Press select to refresh';
var ERROR_OCCURRED_TEXT = 'Error occurred';
var LOADING_TEXT = 'Loading...';
var SETTINGS_URL = 'http://scastiel.me/pebethicker/settings/';
var GATECOIN_API_URL = 'https://www.gatecoin.com/api/Public/LiveTickers';

var items = [];
var section = {
    items: items
};
var menu = new UI.Menu({
    sections: [section]
});
menu.on('select', refreshTickersFromAPI);
menu.show();

refreshTickersFromAPI();

var tickersToShow;

function updateTickers(tickers) {
    section.title = PRESS_SELECT_TO_REFRESH_TEXT;
    items.length = 0;
    tickersToShow.forEach(function (tickerToShow) {
        var ticker = tickers[tickerToShow];
        var last;
        if (ticker) {
            last = ticker.last;
        } else if (tickerToShow === 'ETHUSD') {
            last = tickers.ETHBTC.last * tickers.BTCUSD.last;
        }

        if (last) {
            var fromCurrency = tickerToShow.slice(0, 3);
            var toCurrency = tickerToShow.slice(3);
            var formattedLast = Math.round(last * 10000) / 10000;
            var string = '1 ' + fromCurrency + ' = ' + formattedLast + ' ' + toCurrency;
            items.push({ title: tickerToShow, subtitle: string });
        }
    });
    menu.section(0, section);
}

function fetchTickersToShowFromSettings() {
    tickersToShow = Settings.option('tickers');
    if (!tickersToShow || tickersToShow.length === 0) {
        tickersToShow = ['ETHBTC', 'ETHEUR'];
        Settings.option('tickers', tickersToShow);
    }
}

function refreshTickersFromAPI() {
    fetchTickersToShowFromSettings();
    section.title = LOADING_TEXT;
    menu.section(0, section);
    ajax({ url: GATECOIN_API_URL, type: 'json' },
        function (data) {
            var tickers = {};
            data.tickers.forEach(function (ticker) {
                tickers[ticker.currencyPair] = ticker;
            });
            updateTickers(tickers);
        },
        function (error) {
            console.error(error);
            section.title = ERROR_OCCURRED_TEXT;
            menu.section(0, section);
        });
}

Settings.config(
    { url: SETTINGS_URL },
    function (e) {
        tickersToShow = e.options.tickers;
    }
);