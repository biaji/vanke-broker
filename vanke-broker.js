// ==UserScript==
// @name     万科购房脚本
// @version  0.1
// @grant    none
// @match        http://fang.vanke.com/*
//require        https://libs.baidu.com/jquery/2.1.1/jquery.js
// ==/UserScript==

var wantedList = [3004, 3002, 3001,
                  2904, 2902, 2901,
                  2804, 2802, 2801,
                  2704, 2702, 2701,
                  3104, 3102, 3101,
                  3204, 3202, 3201
                 ];

var roomSelected;

function wkgo() {
    var list = $(".status2");
    if (roomSelected) {
        for (var i = 0; i < list.size(); i++) {
            var roomNum = trimRoomNum(list[j].text);
            if (roomSelected == roomNum) {
                console.log("Already: " + roomNum);
                list[j].click();
            }
        }
        roomSelected = 0;
    }

    // 首先优选指定房号
    for (var j = 0; !roomSelected && j < list.size(); j++) {
        var roomNum = trimRoomNum(list[j].text);
        for (var i = 0; i < wantedList.length; i++) {
            if (wantedList[i] == roomNum) {
                console.log("Got: " + roomNum);
                roomSelected = roomNum;
                list[j].click();
            }
        }
    }

    //如果没有则依照其余顺序选择
    for (var i = 0; !roomSelected && i < list.size(); i++) {
        if (isWanted(list[i].text)) {
            list[i].click();
            break;
        }
    }
}

function trimRoomNum(coarse){
    var tmp = coarse.trim();
    var exact = tmp.substr(0, tmp.indexOf("("));
    var building = $("a.nametd.current")[0].text.trim();
    if(building.startsWith("6")){
        exact = tmp.substr(tmp.indexOf("-") + 1, tmp.indexOf("(")-2);
    }
    return exact;
}


// 判断是否是需要的房 需要进一步实现房号
function isWanted(number) {
    console.log("number:" + number);
    return false;
    var roomNum = parseInt(number.trim().substr(0, 4), 10);
    var floorNum = parseInt(number.trim().substr(0, 2), 10);
    console.log("number:" + roomNum);
    for (var j = 0; j < wantedList.length; j++) {
        if (roomNum == wantedList[j]) {
            roomSelected = roomNum;
            return true;
        }
    }

    if (floorNum > 24 && floorNum < 34) return true;
    return false;
}

function start() {
    //修改流拍按钮为入口
    $(".target_ylp").empty();
    $(".target_ylp").append("<a href='#' onClick='wkgo()'>GO！！</a>");
}

start();

document.addEventListener(
    'keydown',
    function(event) {
        var key = String.fromCharCode(event.keyCode);
        if (key.toLowerCase() == 'z') {
            wkgo();
        }
    },
    false
);

$(document).ready(wkgo());

$(document).ajaxComplete(function (){
    //step1:
    if($("a.quick_price").length != 0){
        $("a.quick_price").click();
    }

    //step2:
    if($("a.btn.btn-default.btn-primary").length != 0){
        $("a.btn.btn-default.btn-primary").click();
    }

    //DEMO
    if($("a.quick_price").length != 0){
        console.log($("a.quick_price"));
    }else{
        console.log("NOT THIS");
    }
    if($(".quick_price_success").length != 0){
        console.log("GOGOGGOGO");
    }else {
        console.log("LOST");
    }
});