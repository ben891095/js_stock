eudora chen
var stock_list = ["1101","3231","2330"]; 
var url = 'https://tw.quote.finance.yahoo.net/quote/q?type=tick&sym=1457';


$.ajax({
    url:url,
    dataType:'jsonp',
    jsonp: 'callback',
    jsonpCallback: 'jsonp_callback'
});

function jsonp_callback(data) {
    console.log(data)
}