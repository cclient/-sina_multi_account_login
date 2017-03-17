///<TypeScriptExperimentalAsyncFunctions>true</TypeScriptExperimentalAsyncFunctions>
/// <reference path='../../typings/node/node.d.ts' />

'use strict';
var myasync = require("../utils/myasync");
var request = require("request");
var Readable = require('stream').Readable;
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var config = require("../config");
var CTask = require("../utils/ITask");

let accountObj = {
    "5555555555": {email: "abc@sina.cn", passwd: "passwd", issuccess: false}
};

function getNoRefrestAccountArr() {
    let accountArr = [];
    for (var key in accountObj) {
        if (accountObj[key]["issuccess"] === false) {
            accountArr.push({
                email: accountObj[key]["email"],
                passwd: accountObj[key]["passwd"]
            })
        }
    }
    return accountArr;
}

//所有账号(有不成功的，不断迭代)
async function refreshAllAccountUntilAllSuccess() {
    let accountArr = [];
    return myasync.whilst(
        function () {
            accountArr = getNoRefrestAccountArr();
            return (accountArr.length > 0);
        },
        async function () {
            await refreshAccounts(accountArr);
            await setAccountSuccessStatus();
        }
    )
}

//所有账号过一遍(过完可能有不成功项)
async function refreshAccounts(accountArr) {
    let num = -1;
    return myasync.whilst(
        function () {
            return (num++ < accountArr.length - 1);
        },
        function () {
            return new Promise(function (resolve, reject) {
                let account = accountArr[num];
                console.log(account);
                let body = refresh(account.email, account.passwd);
                resolve(body);
            })
        }
    )
}

//所有账号过一遍(过完可能有不成功项)
async function refreshAccounts_Test() {
    let accountArr = getNoRefrestAccountArr();
    (function () {
        let num = -1;
        return myasync.whilst(
            function () {
                return (num++ < accountArr.length - 1);
            },
            function () {
                return new Promise(function (resolve, reject) {
                    let account = accountArr[num];
                    console.log(account);
                    let body = refresh(account.email, account.passwd);
                    resolve(body);
                })
            }
        )
    })();
}

async function getCodeImgB64fromImgB64(imgbase: string) {
    return new Promise<string>(function (resolve, reject) {
        var host = config.codeurl;
        var path = config.codepath;
        var appcode = config.appcode;
        var url = host + path;
        request({
            method: 'POST',
            url: url,
            headers: {
                Authorization: 'APPCODE ' + appcode,
                "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            form: {
                "convert_to_jpg": "0",
                // "img_base64": "data:image/png;base64,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",
                "img_base64": imgbase,
                "typeId": "3050"
            }
        }, function (error, response, body) {
            //{"showapi_res_code":0,"showapi_res_error":"","showapi_res_body":{"Result":"NGCFU","ret_code":0,"Id":"67e623a0-c610-4a21-a8be-267d12c0b03f"}}
            var body = JSON.parse(body);
            resolve(body.showapi_res_body.Result)
        })

    })
}

async function sendCode(email: string, passwd: string, code: string, code_count: number) {
    return new Promise<string>(function (resolve, reject) {
        request({
            method: 'POST',
            url: config.serverurl,
            headers: {},
            form: {
                "email": email,
                "passwd": passwd,
                "code": code
            }
        }, function (error, response, body) {
            resolve(body)
        })
    })
}
async function setAccountSuccessStatus() {
    let expiresday = new Date();
    expiresday.setDate(expiresday.getDay() + 27);
    let timenum = expiresday.getTime() / 1000;
    return new Promise<any>(function (resolve, reject) {
        request({
            method: 'GET',
            url: config.resulturl,
        }, function (error, response, body) {
            let accounts = JSON.parse(body);
            for (let i = 0; i < accounts.length; i++) {
                let uid = accounts[i]["u_id"];
                if (accountObj[uid] && accounts[i]["expiresAt"] > timenum) {
                    accountObj[uid]["issuccess"] = true;
                }
            }
            resolve(null);
        })
    })
}

async function sendEmailAndPasswd(email: string, passwd: string) {
    return new Promise(function (resolve, reject) {
        request({
            method: 'POST',
            url: config.serverurl,
            headers: {},
            form: {
                "email": email,
                "passwd": passwd,
                "code": null
            }
        }, function (error, response, body) {
            resolve(body)
        })
    })
}


async function getCodeImgfromImgB64(imgbase: string) {
    return new Promise<string>(function (resolve, reject) {
        let imageBuffer = new Buffer(imgbase, 'base64');
        let s = new Readable();
        s.push(imageBuffer);
        s.push(null);
        gm(s).crop(77, 32, 426, 206)
            .noProfile()
            .toBuffer('PNG', function (err, buffer) {
                resolve(buffer.toString('base64'))
            })
    })
}

async function gonext(body, email, passwd) {
    body = JSON.parse(body);
    if (body.status == "code") {
        let codebase64 = await getCodeImgfromImgB64(body.imgbase64);
        let code = await getCodeImgB64fromImgB64(codebase64);
        let newbody = await sendCode(email, passwd, code, 0);
        await gonext(newbody, email, passwd);
    } else {
        console.log("no code");
        console.log(body);
    }
}

async function refresh(email, passwd) {
    let body = await sendEmailAndPasswd(email, passwd);
    await  gonext(body, email, passwd);
}


module.exports.refreshAllAccountUntilAllSuccess = refreshAllAccountUntilAllSuccess;

if (!module.parent) {
    let task = new CTask("job test", refreshAllAccountUntilAllSuccess);
    console.log(" job test start" + task.start())
}