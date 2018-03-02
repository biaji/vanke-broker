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
// 6 号楼
var isSix = true;

var roomSelected;

var step1 = false;

var step2 = false;


function wkgo() {

    // init
    step1 = false;
    step2 = false;

    var tag = $(".thumbnail.red.size24");

    if(tag.size()>0){
        if(isSix){
            tag[0].click();
        }else{
            tag[1].click();
        }
    }

    var list = $(".status2");
    if (roomSelected) {
        for (var i = 0; i < list.size(); i++) {
            var roomNum = trimRoomNum(list[i].text);
            if (roomSelected == roomNum) {
                console.log("Already: " + roomNum);
                list[i].click();
            }
        }
        roomSelected = 0;
    }

    // 首先优选指定房号
    for (var i = 0; !roomSelected && i < wantedList.length; i++) {
        for (var j = 0;  j < list.size(); j++) {
            var roomNum = trimRoomNum(list[j].text);
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
    if(isSix){
        exact = tmp.substr(tmp.indexOf("-") + 1, tmp.indexOf("(")-2);
    }
    return exact;
}


// 判断是否是需要的房
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

    if($(".messenger-message.message.alert.error.message-error.alert-error:visible").length > 0){
        return;
    }

    //step2:
    if(!step2 && $("a.btn.btn-default.btn-primary").length > 0){
        $("a.btn.btn-default.btn-primary")[0].click();
        step2 = true;
        return;
    }

    //step1:
    if(!step1 && $("a.quick_price").length != 0){
        $("a.quick_price")[0].click();
        step1 = true;
    }

});