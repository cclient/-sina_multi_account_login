///<TypeScriptExperimentalAsyncFunctions>true</TypeScriptExperimentalAsyncFunctions>
/// <reference path='../../typings/node/node.d.ts' />

'use strict';
var http = require("http");

function getCurTs() {
    return new Date().getTime() / 1000;
}

function cloneObj(obj) {
    if (typeof (obj) != 'object') {
        return null;
    }
    var newObj = JSON.stringify(obj);
    return JSON.parse(newObj);

}

function accessWebAPI(host, path, method, postdata, callback) {
    var queryoptions = {
        host: host,
        //        port: 8000,
        path: path,
        method: method,
        headers: {
            "Content-Type": 'application/json'
            //            "Content-Length": data.length
        }
    };
    var senddata = '';
    var req = http.request(queryoptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            senddata += chunk;
        });
        res.on('end', function () {
            try {
                callback(null, JSON.parse(senddata));
            } catch (error) {
                callback(null, {});
            }

        });
    });
    if (postdata) {
        req.write(JSON.stringify(postdata) + '\n');
    }
    else {
        req.write('' + '\n');
    }
    req.on('error', function (e) {
        console.log('api error' + e);
        callback(e, null);
    });
    req.end();
}

function getTodayTimeZero() {
    let date = new Date();
    date.setHours(0, 0, 0, 0)
    return date.getTime() / 1000
}


module.exports.accessWebAPI = accessWebAPI
module.exports.getTodayTimeZero = getTodayTimeZero
module.exports.getCurTs = getCurTs
