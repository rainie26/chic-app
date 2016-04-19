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

var app = {
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    bindEvents: function() {

        var TOUCH_START = 'touchstart';
        if (window.navigator.msPointerEnabled) { // windows phone
            TOUCH_START = 'MSPointerDown';
        }
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener(TOUCH_START, this.refreshDeviceList, false);
        sendButton.addEventListener(TOUCH_START, this.sendData, false);
        disconnectButton.addEventListener(TOUCH_START, this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false);
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        bluetoothSerial.list(app.onDeviceList, app.onError);
    },
    onDeviceList: function(devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

        devices.forEach(function(device) {

            var listItem = document.createElement('li'),
                html = '<b>' + device.name + '</b><br/>' + device.id;

            listItem.innerHTML = html;

            if (cordova.platformId === 'windowsphone') {
              // This is a temporary hack until I get the list tap working
              var button = document.createElement('button');
              button.innerHTML = "Connect";
              button.addEventListener('click', app.connect, false);
              button.dataset = {};
              button.dataset.deviceId = device.id;
              listItem.appendChild(button);
            } else {
              listItem.dataset.deviceId = device.id;
            }
            deviceList.appendChild(listItem);
        });

        if (devices.length === 0) {

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
                bluetoothSerial.subscribe('\n', app.onData, app.onError);

                resultDiv.innerHTML = "Box Connected!<br/>";
                app.setStatus("Connected");
                app.showDetailPage();
            };

        var deviceId = e.target.dataset.deviceId;
        if (!deviceId) { // try the parent
            deviceId = e.target.parentNode.dataset.deviceId;
        }

        bluetoothSerial.connect(deviceId, onConnect, app.onError);
    },
    onData: function(data) { // data received from Arduino
        console.log(data);
        alert(data);
        resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + data + "<br/>";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    sendData: function(event) { // send data to Arduino
        var profile = getProfileNumber();
        var cookingT = getCookingTime();
        var msgValue = profile+cookingT;
        // var msgValue = "P001T001";

        var success = function() {
            console.log("success");
            resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + msgValue + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function() {
            alert("Failed writing data to Bluetooth peripheral");
        };

        var data = msgValue;
        bluetoothSerial.write(data, success, failure);
    },
    disconnect: function(event) {
        bluetoothSerial.disconnect(app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.style.display = "";
        detailPage.style.display = "none";
    },
    showDetailPage: function() {
        mainPage.style.display = "none";
        detailPage.style.display = "";
    },
    setStatus: function(message) {
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusDiv.innerHTML = message;
        statusDiv.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            statusDiv.className = 'fadeout';
        }, 5000);
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};


// var _category, _quant;
// var _profileNumber = -1;
// var _cookingTime = -1;

// function getFoodName(){
//     var e = document.getElementById("foodCat");
//     var category = e.options[e.selectedIndex].value;
//     console.log("food: "+category);
//     _category = category;
// }

// function getFoodQuant(){
//     var e = document.getElementById("foodQuant");
//     var quant = e.options[e.selectedIndex].value;
//     console.log("quant: "+quant);
//     _quant = quant;
// }

function getProfileNumber()
{
    var e = document.getElementById("foodCat");
    var category = e.options[e.selectedIndex].value;

    var ee = document.getElementById("foodQuant");
    var quant = ee.options[ee.selectedIndex].value;

    var profileNumber = calProfile(category,quant);
    console.log(profileNumber);
    return profileNumber;
}

function calProfile(_category,_quant)
{
    var tempProfile;
    //
    tempProfile = _category+_quant;
    return tempProfile;
}

function getCookingTime()
{
    var hours = document.getElementById("hour").value;
    var minutes = document.getElementById("minute").value;

    var cookingTime = calCookingTime(hours, minutes);
    if (cookingTime<10)
        cookingTime = "00"+cookingTime;
    else if (cookingTime<100)
        cookingTime = "0"+cookingTime;
    
    cookingTime = "T" + cookingTime;
    console.log(cookingTime);
    return cookingTime;
}


function calCookingTime(hours, minutes)
{
    var tempCookingTime;
    //calculate based on parameters
    tempCookingTime = hours*60 + minutes*1;

    return tempCookingTime;
}

// function sendProfile_Time()
// {
//     if(_profileNumber != -1 && _cookingTime != -1)
//     {
//         //send via bluetooth
//     }
//     //reset 
//     _profileNumber = -1;
//     _cookingTime = -1;
// }

function test()
{
    var a = getCookingTime();
    var b = getProfileNumber();
    console.log(b+a);
}
