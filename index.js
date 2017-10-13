
var cookie_name = 'cookie_stock';
//設定更新時間(秒)
var set_count_down = 181; 
//剩餘時間
var count_down = set_count_down; 
var switch_count_down = true; 
//console.log(js_get_cookie(cookie_name));
//js_del_cookie(cookie_name);

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
    var stock_block = '';
    
    if (stock_array[0] != '') {
        $.each(stock_array, function(key, value) {
            stock_block = stock_block + 
                "<div class='stock_block' data-stock_index='"+value+"'>" +
                    "<div class='index'></div>" +
                    "<div class='name'></div>" +
                    "<div class='deal'></div>" +
                    "<div class='kline'><svg><line></line><polyline></polyline></svg></div>" +
                    "<div class='change'></div>" +
                    "<div class='change_range'></div>" +
                    "<div class='volume'></div>" +
                    "<div class='volume_total'></div>" +
                    "<div class='link'><a class='btn btn-primary btn-sm' href='http://pchome.megatime.com.tw/stock/sto0/ock1/sid"+value+".html' target='_blank'>連結</a></div>" +
                    "<div class='delete'><button class='btn btn-danger btn-sm btn_del'>刪除</button></div>" +
                "</div>";
        });
        
        //console.log(stock_block);
    }
    else {
        //cookie 沒有股票資料
        stock_block = 
            "<div class='stock_block'>" +
                "*使用方式 在右上方輸入股票代碼<br><br>" +
                "*左邊為股票資料顯示方式" +
            "</div>" +
            "<div class='stock_block'>" +
                "<div class='index'>編號</div>" + 
                "<div class='name'>名稱</div>" +
                "<div class='deal'>成交價</div>" +
                "<div class='kline'>K線</div>" +
                "<div class='change'>漲跌</div>" +
                "<div class='change_range'>漲跌幅</div>" +
                "<div class='volume'>單量</div>" +
                "<div class='volume_total'>總量</div>" +
                "<div class='link'><button class='btn btn-primary btn-sm'>連結</button></div>" +
                "<div class='delete'><button class='btn btn-danger btn-sm'>刪除</button></div>" +
            "</div>";
    }
    
    $('.stock_group').append(stock_block); 
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
            
            this_index_stock.removeClass('font_red font_green');
            
            var index_str = stock_data['name']+' '+stock_data['125'];
            if (change > 0) {
                this_index_stock.addClass('font_red');
                index_str = index_str + ' ▲'+change;
            }
            else if (change < 0){
                this_index_stock.addClass('font_green');
                index_str = index_str + ' ▼'+change;
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
    
    if (stock_array[0] != '') {
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
                
                //填資料
                this_stock_block.find('.index').text(stock_data['id']);
                this_stock_block.find('.name').text(stock_data['name']);
                this_stock_block.find('.deal').text(stock_data['125']);
                this_stock_block.find('.change_range').text(Math.round(stock_data['185']*100)/100+'%');
                this_stock_block.find('.volume').text(stock_data['413']);
                this_stock_block.find('.volume_total').text(stock_data['404']);
                
                //上色
                this_stock_block.removeClass('bg_red bg_green font_red font_green');
                
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
                
                //畫k線
                var high = stock_data['130'] == undefined ? 0 : parseFloat(stock_data['130']);
                var low = stock_data['131'] == undefined ? 0 : parseFloat(stock_data['131']);
                var open = stock_data['126'] == undefined ? 0 : parseFloat(stock_data['126']);
                var open_axis = (high - low) == 0 ? 0 : 100 - (100/(high - low))*(open - low);
                var deal_axis = (high - low) == 0 ? 0 : 100 - (100/(high - low))*(deal - low);
                
                this_stock_block.find('.kline').removeClass('k_red k_green');
                
                if (high == low) {
                    //中間
                    this_stock_block.find('.kline polyline').attr('points', '0,50 30,50 30,45 0,45');
                }
                else {
                    //k線上色
                    if (deal > open){
                        //紅
                        this_stock_block.find('.kline').addClass('k_red');
                    }
                    else if (deal < open) {
                        //綠
                        this_stock_block.find('.kline').addClass('k_green');
                    }
                    
                    //頂部 與 底部 防止被切掉
                    if (open_axis == deal_axis) {
                        if (open_axis > 99) {
                            deal_axis = deal_axis-5;
                        }
                        else if (open_axis < 1) {
                            deal_axis = deal_axis+5;
                        }
                        else {
                            open_axis = open_axis - 2.5;
                            deal_axis = deal_axis + 2.5;
                        }
                    }
                    
                    this_stock_block.find('.kline line').attr('x1',15).attr('y1',0).attr('x2',15).attr('y2',100);
                    this_stock_block.find('.kline polyline').attr('points', '0,'+open_axis+' 30,'+open_axis+' 30,'+deal_axis+' 0,'+deal_axis+'');
                }
                
            });
        });
    }
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