/** --------------------------------------------------------------------
 *  Cookie 
 *  js_set_cookie 設定
 *  js_get_cookie 取得
 *  js_del_cookie 刪除
 * --------------------------------------------------------------------*/

/** 
 *  名稱: js_set_cookie
 *  功能: 設定cookie
 * 
 *  傳入
 *  string cookie_name 名稱
 *  string cookie_value 值
 *
 *  回傳
 *  no return
 **/
function js_set_cookie(cookie_name , cookie_value) {
    //設定到期時間
    var expire = new Date();
    expire.setTime(expire.getTime() + (365*24*60*60*1000));
    //寫入內容與到期時間
    document.cookie = cookie_name + '=' + escape(cookie_value) + ';expires=' + expire.toGMTString() + ';path=/';
    //console.log(cookie_name + '=' + escape(cookie_value) + ';expires=' + expire.toGMTString() + ';path=/');
}

/** 
 *  名稱: js_get_cookie
 *  功能: 取得cookie
 * 
 *  傳入
 *  string cookie_name 名稱
 *
 *  回傳
 *  string 字串
 **/
function js_get_cookie(cookie_name) {
    //要搜尋的字串
    var search_str = cookie_name + '='
    //取cookie
    var cookie_array = document.cookie.split(';');
    //console.log(document.cookie);
    
    var get_cookie = '';
    
    for(var i = 0; i < cookie_array.length; i++) {
        //-1代表沒找到字串
        if (cookie_array[i].search(search_str) != -1) {
            
            //把cookie name取代掉 再回傳, trim()頭尾去空白
            get_cookie = unescape(cookie_array[i].trim().replace(search_str, ''));
        }
    }
    
    return get_cookie;
}

/** 
 *  名稱: js_del_cookie
 *  功能: 刪除cookie
 *
 *  傳入
 *  string cookie_name 名稱
 *
 *  回傳
 *  no return
 **/
function js_del_cookie(cookie_name) {
    //設定一個過期的時間
    var expire = new Date();
    expire.setTime(expire.getTime() -1);
    document.cookie = cookie_name + '=' + ';expires=' + expire.toGMTString() + ';path=/';
}