
var cookie_name = 'cookie_stock';
//設定更新時間(秒)
var set_count_down = 181; 
//剩餘時間
var count_down = set_count_down; 
var switch_count_down = true; 
console.log(js_get_cookie(cookie_name));

/* ajax 股票取資料
 * 
 * stock_index 股票代碼
 * func 回傳函數
 */
function yahoo_stock_data (stock_index, func) {
    
    var url = 'https://tw.quote.finance.yahoo.net/quote/q?type=mem&sym=' + stock_index;
    
    $.ajax({
        url:url,
        dataType:'jsonp',
    }).done(function(data) {
        func(data);
    });
}

/* 產生股票方塊
 * 
 */
function gen_stock_block () {
    //股票方塊清空
    $(".stock_block").remove();
    
    //股票列表
    var stock_array = js_get_cookie(cookie_name).split(',');

    $.each(stock_array, function(key, value) {
        var stock_block = 
            "<div class='stock_block' data-stock_index='"+value+"'>" +
                "<div class='index'></div>" +
                "<div class='name'></div>" +
                "<div class='deal'></div>" +
                "<div class='change'></div>" +
                "<div class='change_range'></div>" +
                "<div class='volume'></div>" +
                "<div class='volume_total'></div>" +
                "<div class='link'><a class='btn btn-info btn-sm' href='http://pchome.megatime.com.tw/stock/sto0/ock1/sid"+value+".html' target='_blank'>連結</a></div>" +
                "<div class='delete'><button class='btn btn-danger btn-sm btn_del'>刪除</button></div>" +
            "</div>";
            
        $('.stock_group').append(stock_block);  
    });
}

/* 載入上市上櫃資料
 * 
 */
function load_index_stock () {
    var stock_index = {'tse':'%23001', 'otc':'%23026'};
    
    $.each(stock_index, function(key, value) {
        yahoo_stock_data(value, function(stock_data) {
            //console.log(stock_data);
            stock_data = stock_data['mem'];
            var change = parseFloat(stock_data['184']);
            var this_index_stock = $('.'+key);
            
            var index_str = stock_data['name']+' '+stock_data['125'];
            if (change > 0) {
                this_index_stock.addClass('font_red');
                index_str = index_str + '▲'+change;
            }
            else if (change < 0){
                this_index_stock.addClass('font_green');
                index_str = index_str + '▲'+change;
            }
            
            this_index_stock.text(index_str);
        });
    });
}

/* 股票方塊 載入資料
 * 
 */
function load_stock_data () {
    //股票列表
    var stock_array = js_get_cookie(cookie_name).split(',');
    
    $.each(stock_array, function(key, value) {
        yahoo_stock_data(value, function(stock_data) {
            //console.log(stock_data);
            //125成交, 126開盤, 128昨量, 129昨收, 130最高, 131最低, 132漲停價, 133跌停價, 172振幅, 184漲跌, 185漲幅, 404總量, 413單量
            stock_data = stock_data['mem'];
            var this_stock_block = $('.stock_block[data-stock_index='+value+']');
            var deal = parseFloat(stock_data['125']);
            var change = parseFloat(stock_data['184']);
            var limit_up = parseFloat(stock_data['132']);
            var limit_down = parseFloat(stock_data['133']);
            
            //highlighted background
            if (stock_data['404'] != this_stock_block.find('.volume_total').text()) {
                this_stock_block.addClass('highlighted');
                 setTimeout(function () {
                    this_stock_block.removeClass('highlighted');
                }, 500);
            }
            
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

//控制股票更新資料 
function control_load_stock() {
    
    load_index_stock();
    load_stock_data();
    
    //產生時間字串
    var d = new Date();
    $('.now').text('更新時間 '+ d.getHours()+':'+d.getMinutes()+':'+d.getSeconds());
    
    //重新計時
    count_down = set_count_down; 
}

//倒數計時器
function countdown() {  
    if (switch_count_down) {
        count_down = count_down - 1;
        
        $('.count_down').text('倒數更新 ' + count_down);
        
        if (count_down <= 0) {
            control_load_stock();
        }
    }
    
    setTimeout(function () {
        countdown();
    },1000);
}

//網站載入完成 執行
$(document).ready(function() {
    countdown();
    gen_stock_block();
    control_load_stock();
});

//手動更新 報價
$('.btn_load_stock').click(function () {
    control_load_stock();
});

//設定倒數計時開關
$('.btn_switch').click(function () {
    if (switch_count_down) {
        switch_count_down = false; 
        $(this).text('開啟自動更新');
    }
    else {
        switch_count_down = true; 
        $(this).text('停止自動更新');
    }
    
    $(this).toggleClass("btn-success btn-warning");
});

//新增股票
$('.btn_add').click(function () {
    var stock_index = $('input[name=index]').val();
    var stock_str = js_get_cookie(cookie_name);

    //取資料
    yahoo_stock_data(stock_index, function(stock_data) {
        stock_data = stock_data['mem'];

        //檢查有沒有這檔股票
        if (stock_data['name'] == '') {
            alert('查無此股票代碼')
            return false;
        }
        
        //檢查是否已經有這檔
        if (stock_str.indexOf(stock_index) != -1) {
            alert('重複輸入此股票代碼')
            return false;
        }
        
        stock_array = stock_str.split(',');
        if (stock_array[0] == '') {
            stock_array[0] = stock_index;
        }
        else {
            stock_array.push(stock_index);
        }
        
        //console.log(stock_array,stock_array.join());
        //寫入cookie
        js_set_cookie(cookie_name, stock_array.join());
        
        $('input[name=index]').val('');
        
        gen_stock_block();
        load_stock_data();
    });
});

//刪除股票
$(document).on('click', '.btn_del', function() {
    //要刪的股票代碼
    var stock_del = $(this).parent().parent().data('stock_index').toString();
    
    if(confirm("確定要刪除關注股票 "+stock_del)) {
        //股票列表
        var stock_array = js_get_cookie(cookie_name).split(',');
    
        //找尋要刪的資料
        stock_array.splice(stock_array.indexOf(stock_del), 1);
    
        //寫入cookie
        js_set_cookie(cookie_name, stock_array.join());    
        
        gen_stock_block();
        load_stock_data();
    }
});

//sortable 移動排序
$('.stock_group').sortable({
    cursor: 'move',
    opacity: 0.6,
    update: function() {
        var stock_array = [];
        
        //順序改變完成 修改cookie順序
        $('.stock_block').each(function() {
            stock_array.push($(this).data('stock_index'));
        });   
        
        //console.log(stock_array);
        //寫入cookie
        js_set_cookie(cookie_name, stock_array.join());  
    }
});