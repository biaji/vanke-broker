// ==UserScript==
// @name     万科购房脚本
// @version  0.2
// @grant    none
// @match        http://fang.vanke.com/*
//require        https://libs.baidu.com/jquery/2.1.1/jquery.js
// ==/UserScript==

var wantedList = [2602,2603,1601,3301,2702,2703,2502,2503];

const TARGET_TIME = new Date("2018-03-23 19:00");

// 6 号楼
var isSix = false;

// 是否为车位
var isParking = true;

var roomSelected;

var step1 = false;

var step2 = false;

var done = false;

const TIMER_SLICE = 50;

// 定时器
var timerId;

// 剩余时间
var timeLeft;


function wkgo() {
    console.log("GOGOGO");
    // init
    step1 = false;
    step2 = false;
	if(isParking){
		grabParking();
	}else{
		grabDorm();
	}
}

function grabDorm(){
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
                console.log("Try: " + roomNum);
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

function grabParking(){
	var list = $(".price_in");
	list[0].click();
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
    var roomNum = parseInt(number.trim().substr(0, 4), 10);
    var floorNum = parseInt(number.trim().substr(0, 2), 10);

    if (floorNum > 24 && floorNum < 34) return true;
    return false;
}

function start() {
    timeLeft = timeLeft -TIMER_SLICE;
    if(timeLeft > 120000){
        $(".target_ylp").empty();
        $(".target_ylp").append("<a href='#' onClick='wkgo()' class='red size24'>"+Math.floor(timeLeft/1000/60)+":"+ Math.floor(timeLeft/1000%60)+"</a>");
    }else if(timeLeft <= 150) {
        wkgo();
    } else if (timeLeft < 50){
        clearInterval(timerId);
        wkgo();
    } else {
        $(".target_ylp").empty();
        $(".target_ylp").append("<a href='#' onClick='wkgo() class='red size24''>"+(timeLeft/1000).toFixed(2)+"</a>");
    }
}

function syncTime(){
    var requestTime = new Date();
    var tmpSrvTime =  new Date($.ajax({async: false}).getResponseHeader("Date"));
    var endTime = new Date();
    var transferTime = Math.floor((endTime-requestTime)/3*2); //取三分之二
    var offset = endTime - tmpSrvTime - transferTime;
    timeLeft = TARGET_TIME - tmpSrvTime - transferTime - TIMER_SLICE;
    console.log("transfer: " + transferTime + " offset: " + offset);
    timerId =  setInterval(start, TIMER_SLICE);
}


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

jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ?
				matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
};

$(document).ready(syncTime());

//$(document).ajaxComplete(function (event, request, settings){

$(document).ajaxSuccess(function (event, request, settings){
    console.log("complete");
    if($("a.add_price_over").length != 0){
        wantedList.shift();
        console.log(roomSelected + " failed" );
        roomSelected = null;
        step1 = false;
        step2 = false;
        wkgo();
        return;
    }

    if(done){
        return;
    }

    if($("a.add_price_start").length > 0){
        return;
    }

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
    if(!step1 && $("a:regex(class, quick_price.*)").length != 0){
        $("a:regex(class, quick_price.*)")[0].click();
        step1 = true;
    }

});
