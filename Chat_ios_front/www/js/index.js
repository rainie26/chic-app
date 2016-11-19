// (c) 2013-2015 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton, statusDiv */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global cordova, bluetoothSerial  */
/* jshint browser: true , devel: true*/
'use strict';

$("#mainPage").css("display", "none");
$("#detailPage").css("display", "none");

var stopFlag = false;
var quickFlag = false;
var app = {
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    bindEvents: function() {

        var TOUCH_START = 'click';//'touchstart';
        // if (window.navigator.msPointerEnabled) { // windows phone
        //     TOUCH_START = 'MSPointerDown';
        // }
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener(TOUCH_START, this.refreshDeviceList, false);
        sendButton.addEventListener(TOUCH_START, this.sendData, false);
        // disconnectButton.addEventListener(TOUCH_START, this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false);
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        // bluetoothSerial.list(app.onDeviceList, app.onError);
    },
    onDeviceList: function(devices) {
        var option;
        var flag = 0; 


        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");


        devices.forEach(function(device) {
            if(flag == 0){
                flag = 1;
                $("#devicecontrol").css("display", "none");
                $(".devices").css("display", "block");
            }

            var listItem = document.createElement('li'),
                html = '<b>' + device.name + '</b><br/>ID: ' + device.id;

            listItem.innerHTML = html;

            // if (cordova.platformId === 'windowsphone') {
            //   // This is a temporary hack until I get the list tap working
            //   var button = document.createElement('button');
            //   button.innerHTML = "Connect";
            //   button.addEventListener('click', app.connect, false);
            //   button.dataset = {};
            //   button.dataset.deviceId = device.id;
            //   listItem.appendChild(button);
            // } else {
              listItem.dataset.deviceId = device.id;
            // }
            deviceList.appendChild(listItem);
        });

        if (devices.length === 0) {
            alert("No device found!");
            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            deviceList.appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android or Windows Phone
                app.setStatus("Please Pair a Bluetooth Device.");
            }

        } else {
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }

    },
    connect: function(e) {
        var onConnect = function() {
                // subscribe for incoming data
                bluetoothSerial.subscribe('#', app.onData, app.onError);

                app.setStatus("Connected");
                app.showDetailPage();
            };

        var deviceId = e.target.dataset.deviceId;
        if (!deviceId) { // try the parent
            deviceId = e.target.parentNode.dataset.deviceId;
        }

        bluetoothSerial.connect(deviceId, onConnect, app.onError);

        // restart();
    },
    onData: function(data) { // data received from Arduino
        if(data == "S001#"){
            stopFlag = true;
            successStop();
        }
        else if(data.charAt(0) == "P"){
            // alert("Battery power: " + data.substring(2,4));
        }
        console.log(data);
    },
    sendData: function(event) { // send data to Arduino
        calMsg2send();
        inprogress();
    },
    disconnect: function(event) {

        // bluetoothSerial.disconnect(app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.style.display = "";
        detailPage.style.display = "none";
    },
    showDetailPage: function() {
        $("#mainPage").css("display", "none");
        $("#detailPage").css("display", "block");
        $(".optionList").css("display", "none");
    },
    setStatus: function(message) {
        console.log(message);

        // window.clearTimeout(app.statusTimeout);
        // statusDiv.innerHTML = message;
        // statusDiv.className = 'fadein';

        // // automatically clear the status with a timer
        // app.statusTimeout = setTimeout(function () {
        //     statusDiv.className = 'fadeout';
        // }, 5000);
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};

// function getProfileNumber()
// {
//     var e = document.getElementById("foodCat");
//     var category = e.options[e.selectedIndex].value;

//     var ee = document.getElementById("foodQuant");
//     var quant = ee.options[ee.selectedIndex].value;

//     var profileNumber = calProfile(category,quant);
//     console.log(profileNumber);
//     return profileNumber;
// }

// function calProfile(_category,_quant)
// {
//     var tempProfile;
//     //
//     tempProfile = _category+_quant;
//     return tempProfile;
// }

//////////////////////////////////////////

var _category = null;
var _quant = null;
var _profileNumber = null;
var _heatingtime = null;
var _waitingTime = null;
var _heatingT = null;
var _myTime = null;
var tempcategory = new Array();

function setProfileNumber()
{
    _profileNumber = _category + _quant;
    _category = null;
    _quant = null;
}

/////////
function getFoodName(cate)
{
    var category = "F" + cate;

    if($("#"+category).hasClass("selected")){
        $("#"+category).removeClass("selected");
        var index = tempcategory.indexOf(cate)
        tempcategory.splice(index, 1);
    }
    else{
        $("#"+category).addClass("selected");
        tempcategory.push(cate);
    }
}

function setFoodName()
{        
    if(tempcategory.length>0){
        var cate_Min = Math.min.apply(null, tempcategory)
        _category = cate_Min;
        // console.log("F"+_category);
        tempcategory = new Array();

        $("#foodDiv").css("display", "none");
        $("#optionbg1").css("display", "none");
        $("#optionbg2").css("display", "block");
        $("#quantDiv").css("display", "block");
    }
    else
        alert("Please select your food!");
}

function getFoodQuant(quant)
{
        
    _quant = quant;
    if(quant == 1){
        $("#Q1").addClass("selected");
        $("#Q2").removeClass("selected");
    }
    else{
        $("#Q2").addClass("selected");
        $("#Q1").removeClass("selected");
    }

}

function setFoodQuant()
{
    if(_quant == 1 || _quant == 2){
        // setProfileNumber();
        $("#quantDiv").css("display", "none");
        $("#timeDiv").css("display", "block");

        // console.log("Q"+_quant);
        calHeatingPro();
    }
    else
        alert("Please select the quantity!");
}

function getWaitingTime()
{
    var d = new Date();
    var hourN = d.getHours();
    var mimuteN = d.getMinutes();

    var myTime = document.getElementById("myTime").value;
    _myTime = myTime;
    var hours = myTime.split(":")[0];
    var minutes = myTime.split(":")[1];
    // console.log("h:" + hours +"  m:" + minutes);

    var waitingTime = calwaitingTime(hourN, mimuteN, hours, minutes);

    if(waitingTime < _heatingtime){
        alert("You need at least "+_heatingtime+" mins!");
        //go back to settng time
    }
    else if(waitingTime>720){
        alert("Please set time within 12 hours!");
    }
    else{
        waitingTime  = waitingTime - _heatingtime;
        
        // console.log("wait2:" + waitingTime);
        confirmPro();
        _waitingTime = waitingTime;
    }
}


function calwaitingTime(hourN, mimuteN, hours, minutes)
{
    var tempHeatingTime;
    if (hourN > hours || (hourN == hours && mimuteN > minutes) )
        tempHeatingTime = (24 + 1*hours - 1*hourN)*60 + (1*minutes - 1*mimuteN)*1;
    else
        tempHeatingTime = (1*hours - 1*hourN)*60 + (1*minutes - 1*mimuteN)*1;

    return tempHeatingTime;
}

/////////

function backmenuPage()
{
    for(var i=1; i<5; i++)
        if($("#F"+i).hasClass("selected"))
            $("#F"+i).removeClass("selected");
    for(var i=1; i<3; i++)
        // if($("#Q"+i).hasClass("selected"))
            $("#Q"+i).removeClass("selected");

    $(".optionList").css("display", "none");
    $(".menuPage").css("display", "block");
    $("#lunchReady").css("display", "none");
    $("body").css("background", "#9fe086");

    _category = null;
    _quant = null;
    _profileNumber = null;
    _heatingtime = null;
    _waitingTime = null;
    _heatingT = null;
    _myTime = null;
    tempcategory = new Array();
}

function backFoodPage()
{
    $("#foodDiv").css("display", "block");

        $("#optionbg1").css("display", "block");

        $("#optionbg2").css("display", "none");
    $("#quantDiv").css("display", "none");
}

function backQuantPage()
{
    $("#quantDiv").css("display", "block");
    $("#timeDiv").css("display", "none");
}


function confirmPro()
{
    $("#timeDiv").css("display", "none");
    confirmText.innerHTML = "<h2>lunch<br/> to be ready at<br/>" + _myTime +"</h2><br/>"
    $("#confirmDiv").css("display", "block");
}

function inprogress()
{
    $("#confirmDiv").css("display", "none");
    $("#heatingPro").css("display", "block");
    heatingPro.innerHTML = "<h3>I'm working!</h3><br/><br/>"
                        +"<h2>Your lunch<br/>will be ready at<br/>" + _myTime +"</h2><br/>"
                        +"<button class='roundBs' id='stopPro' onclick='stoppro()'>stop</button>";
}

function back2Time()
{
    if(quickFlag == false){
        $("#timeDiv").css("display", "block");
        $("#confirmDiv").css("display", "none");
    }
    else{
        $(".optionList").css("display", "none");
        $("body").css("background", "#9fe086");
        $("#detailPage").css("display", "block");
        $(".menuPage").css("display", "block");
        $("#confirmDiv").css("display", "none");
    }
}

var myVar;
function lunchReady(totalTime)
{
    totalTime = totalTime *1000;
    myVar = setTimeout(function(){
        $("#heatingPro").css("display", "none");
        $("#lunchReady").css("display", "block");
    }, totalTime);
}

function stoppro()
{
    var msgValue = "S000";
    //with response of"S001"

    var success = function() {
        console.log("success");
    };

    var failure = function() {
        alert("Failed writing data to Bluetooth peripheral");
    };

    var data = msgValue;
    // bluetoothSerial.write(data, success, failure);

    setTimeout(function(){
        if (stopFlag == true){
            console.log("success stop")
            stopFlag = false;
        }
        else
            alert("Failed to stop!");
    }, 5000);
}

function successStop()
{
    $("#heatingPro").css("display", "none");
    $(".optionList").css("display", "none");
    $("body").css("background", "#9fe086");
    $("#detailPage").css("display", "block");
    $(".menuPage").css("display", "block");
    // stopFlag = false;
    clearTimeout(myVar);
}

function calHeatingPro() 
{
    setProfileNumber();

    switch(_profileNumber){
        case 11:
        case 12:
        case 21:
        case 22:
        case 31:
        case 32:
        case 41:
        case 42:
            _heatingtime = 30;
            _heatingT = 80;
            break;
        default:
            _heatingtime = 30;
            _heatingT = 80;
            break;

    }
}

function calMsg2send()
{
    var waitMsg = null;
    var heatMsg = null;
    var tempMsg = null;

    if (_waitingTime<10)
        waitMsg = "W00" + _waitingTime;
    else if (_waitingTime<100)
        waitMsg = "W0" + _waitingTime;
    else 
        waitMsg = "W" + _waitingTime;

    if(_heatingtime<10)
        heatMsg = "H00" + _heatingtime;        
    else if(_heatingtime<100)
        heatMsg = "H0" + _heatingtime;
    else
        heatMsg = "H" + _heatingtime;

    if(_heatingT<100)
        tempMsg = "T0" + _heatingT;
    else
        tempMsg = "T" + _heatingT;

    var msgValue = waitMsg + heatMsg + tempMsg;
    console.log(msgValue);

    var success = function() {
        console.log("success");
    };

    var failure = function() {
        alert("Failed writing data to Bluetooth peripheral");
    };

    var data = msgValue;
    // bluetoothSerial.write(data, success, failure);
    var totalTime = (_heatingtime*1 + _waitingTime*1)*60;
    lunchReady(totalTime);
}

function quickHeat () {
    quickFlag = true;
    //non-advanced non-robust
    confirmText.innerHTML = "<h2>lunch<br/> to be ready in<br/>1 minutes</h2><br/>"
    $("#optionbg1").css("display", "none");
    $(".optionList").css("display", "block");
    $(".menuPage").css("display", "none");
    $("body").css("background", "#fffff5");
    $("#foodDiv").css("display", "none");
    $("#quantDiv").css("display", "none");
    $("#timeDiv").css("display", "none");
    $("#heatingPro").css("display", "none");
    $("#confirmDiv").css("display", "block");

    _heatingtime = 1;
    _heatingT = 80;
    _waitingTime = 0;

    var d = new Date();
    var hourN = d.getHours();
    var mimuteN = d.getMinutes();
    var minuteCal = mimuteN*1 + 20;
    if(minuteCal>59){
        hourN = hourN*1 +1;
        mimuteN = minuteCal - 60;
    }
    if (mimuteN<10)
        _myTime = hourN +":0"+mimuteN;
    else
        _myTime = hourN +":"+mimuteN;
}

// function alertDismissed()
// {

// }

function pushnotification() {
    // var push = PushNotification.init({
    //         "ios": {
    //             "sound": true,
    //             "vibration": true,
    //             "badge": true
    //         },
    //         "windows": {}
    //     });


    //     push.on('registration', function(data) {
    //         console.log('registration event: ' + data.registrationId);
    //         var oldRegId = localStorage.getItem('registrationId');
    //         if (oldRegId !== data.registrationId) {
    //             // Save new registration ID
    //             localStorage.setItem('registrationId', data.registrationId);
    //             // Post registrationId to your app server as the value has changed
    //         }
    //     });

    //     push.on('error', function(e) {
    //         console.log("push error = " + e.message);
    //     });

    //     push.on('notification', function(data) {
    //         alert('notification event');
    //         navigator.notification.alert(
    //             'You are the winner!',  // message
    //             alertDismissed,         // callback
    //             'Game Over',            // title
    //             'Done'                  // buttonName
    //         );


    //         push.finish(function() {
    //             console.log("processing of push data is finished");
    //         });
    //    });
}
//////////////////////////////////////////



$( "#welcome" ).click(function() {
    $("#welcome").css("display", "none");
    $("#mainPage").css("display", "block");
    $("#devicecontrol").css("display", "block");
    $(".devices").css("display", "none");
});

$( "#programButton" ).click(function() {
    askPower();
    $(".optionList").css("display", "block");
    $(".menuPage").css("display", "none");
    $("body").css("background", "#fffff5");
    $("#foodDiv").css("display", "block");
    $("#optionbg1").css("display", "block");
    $("#optionbg2").css("display", "none");
    $("#quantDiv").css("display", "none");
    $("#timeDiv").css("display", "none");

    $("#heatingPro").css("display", "none");

});

$( "#quickButton" ).click(function() {
    $(".menuPage").css("display", "none");
    quickHeat();
    pushnotification();
    askPower();
});

function askPower() {
    var msgValue = "P000";
    //with response of"S001"

    var success = function() {
        console.log("success");
    };

    var failure = function() {
        alert("Failed writing data to Bluetooth peripheral");
    };

    var data = msgValue;
    // bluetoothSerial.write(data, success, failure);
}

// test
$( "#refreshButton" ).click(function() {
    $("#devicecontrol").css("display", "none");
    $(".devices").css("display", "block");
});

$( "#deviceList" ).click(function() {
    $("#mainPage").css("display", "none");
    $("#detailPage").css("display", "block");
    $(".optionList").css("display", "none");
});

function testsend()
{
    calMsg2send();
    inprogress();
}


