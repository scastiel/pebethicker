/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
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

var tickersToShow = ['ETHBTC', 'ETHEUR'];

refresh();

function refresh() {
  section.title = 'Loading...';
  menu.section(0, section);
  ajax({ url: 'https://www.gatecoin.com/api/Public/LiveTickers', type: 'json' },
      function(data, status, request) {
        section.title = 'Press select to refresh';
        items.length = 0;
        data.tickers.forEach(function(ticker) {
          tickersToShow.forEach(function(tickerToShow) {
    				if (ticker.currencyPair === tickerToShow) {
    					var last = ticker.last;
    					var fromCurrency = tickerToShow.slice(0, 3);
    					var toCurrency = tickerToShow.slice(3);
    					var formattedLast = Math.round(last*10000)/10000;
              var string = '1 ' + fromCurrency + ' = ' + formattedLast + ' ' + toCurrency;
              items.push({ title: tickerToShow, subtitle: string });
    				}
    			});
        });
        menu.section(0, section);
      },
      function(error, status, request) {
        section.title = 'Error occurred';
        menu.section(0, section);
      });
}