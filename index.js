
load_yahoo_stock_json ();
function load_yahoo_stock_json () {
    var stock_list = ['1457','3231','2330','3018','2348','2033']; 
    var url = 'https://tw.quote.finance.yahoo.net/quote/q?type=mem&sym=';
    
    $.each(stock_list, function(key, value) {
        var stock_block = 
            "<div class='stock_block "+value+"'>" +
                "<div class='index'></div>" +
                "<div class='name'></div>" +
                "<div class='deal'></div>" +
                "<div class='change'></div>" +
                "<div class='change_range'></div>" +
                "<div class='volume'></div>" +
                "<div class='volume_total'></div>" +
            "</div>"
        ;
    
        $('.stock_group').append(stock_block);  
        
        $.ajax({
            url:url + value,
            dataType:'jsonp',
        }).done(function(result) {
            //125成交, 126開盤, 128昨量, 129昨收, 130最高, 131最低, 132漲停價, 133跌停價, 172振幅, 184漲跌, 185漲幅, 404總量, 413單量
            //console.log(result);
            stock_data = result['mem'];
            var this_stock_block = $('.stock_block.'+value);
            var deal = parseFloat(stock_data['125']);
            var change = parseFloat(stock_data['184']);
            var limit_up = parseFloat(stock_data['132']);
            var limit_down = parseFloat(stock_data['133']);
            
            this_stock_block.find('.index').text(stock_data['id']);
            this_stock_block.find('.name').text(stock_data['name']);
            this_stock_block.find('.deal').text(stock_data['125']);
            this_stock_block.find('.change_range').text(Math.round(stock_data['185']*100)/100+'%');
            this_stock_block.find('.volume').text(stock_data['413']);
            this_stock_block.find('.volume_total').text(stock_data['404']);
            
            if (deal == limit_up) {
                this_stock_block.addClass('bg_red');
                this_stock_block.find('.change').text('▲'+change);
            }
            else if (deal == limit_down) {
                this_stock_block.addClass('bg_green');
                this_stock_block.find('.change').text('▼'+change);
            }
            else if (change > 0) {
                this_stock_block.addClass('font_red');
                this_stock_block.find('.change').text('▲'+change);
            }
            else if (change < 0) {
                this_stock_block.addClass('font_green');
                this_stock_block.find('.change').text('▼'+change);
            }
            else {
                this_stock_block.find('.change').text(change);
            }
            
        });
    });
}