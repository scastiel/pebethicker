/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Settings = require('settings');
var ajax = require('ajax');

var items = [];
var section = {
  items: items
};
var menu = new UI.Menu({
  sections: [section]
});
menu.on('select', refresh);
menu.show();

refresh();

var tickersToShow;

function refresh() {
  tickersToShow = Settings.option('tickers');
  if (!tickersToShow || tickersToShow.length === 0) {
    tickersToShow = ['ETHBTC', 'ETHEUR'];
    Settings.option('tickers', tickersToShow);
  }
  
  section.title = 'Loading...';
  menu.section(0, section);
  ajax({ url: 'https://www.gatecoin.com/api/Public/LiveTickers', type: 'json' },
      function(data, status, request) {
        var tickers = {};
        data.tickers.forEach(function(ticker) {
          tickers[ticker.currencyPair] = ticker;
        });
        section.title = 'Press select to refresh';
        items.length = 0;
        tickersToShow.forEach(function(tickerToShow) {
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
            var formattedLast = Math.round(last*10000)/10000;
            var string = '1 ' + fromCurrency + ' = ' + formattedLast + ' ' + toCurrency;
            items.push({ title: tickerToShow, subtitle: string });
          }
        });
        menu.section(0, section);
      },
      function(error, status, request) {
        section.title = 'Error occurred';
        menu.section(0, section);
      });
}

Settings.config(
  { url: 'http://scastiel.me/pebethicker/settings/' },
  function(e) {
    console.log("Options", e.options);
    tickersToShow = e.options.tickers;
  }
);