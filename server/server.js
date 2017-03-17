"use strict";
var fs = require('fs');
var webpage = require('webpage');
var server = require('webserver').create();
var system = require('system');


phantom.cookiesEnabled = true;
var codenum = 0;
var issaveimg = false;

if (system.args.length !== 2) {
    console.log('Usage: server.js <portnumber>');
    phantom.exit(1);
}
function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        console.log(" arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
    console.log("");
}
//缓存任务
var taskpages = {}

function pagerenderimg(page, path) {
    if (issaveimg) {
        page.render(path);
    }
}

function auth_first(email, passwd, callback) {
    console.log("auth_first");
    var page = webpage.create();
    phantom.clearCookies();
    page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.87 Safari/537.36';
    var url = "http://auth.socialmaster.cn/wb/4052155134/auth?remark=cly&forcelogin=1";
    page.open(url, function (status) {
        taskpages[email] = page;
    });
    var gologin = false;
    //同一个url会加载两次，第二次的时候再回调
    var codeone = true;
    page.onResourceReceived = function () {
        // console.log("Received " + arguments[0].url + " " + arguments[0].url.indexOf("pin"));
        if (arguments[0].url.indexOf("pin") != -1) {
            if (codeone) {
                codeone = false;
            } else {
                codeone = true;
                setTimeout(function () {
                    pagerenderimg(page, "auth_" + email + "_with_code_img2.png");
                    page.evaluate(function () {
                        console.log("code");
                    });
                }, 2000)
            }
        }
    };
    page.onConsoleMessage = function () {
        // console.log("page.onConsoleMessage");
        // printArgs.apply(this, arguments);
        //点登录
        if (arguments[0] == "login") {
            gologin = true;
        }
        //有验证码的先保存对应的page
        if (arguments[0] == "code") {
            console.log("go get code 1111");
            var base64 = taskpages[email].renderBase64('PNG');
            return callback("code", base64);
        }
        //点同意
        if (arguments[0] == "agree") {
            //点击确认授权
            if (taskpages[email]) {
                taskpages[email] = null
            }
            return callback("agree");
        }
        if (arguments[0] == "aready") {
            //点击确认授权
            if (taskpages[email]) {
                taskpages[email] = null
            }
            callback("aready");
        }
    };
    page.onLoadFinished = function (status) {
        console.log("finish  and is login " + gologin);
        if (!gologin) {
            var script1 = "(function(){ window.email='" + email + "';window.passwd='" + passwd + "' })()";
            page.evaluateJavaScript(script1);
            page.evaluate(function () {
                var input_u = document.getElementById("userId");
                var input_p = document.getElementById("passwd");
                input_u.click();
                input_u.value = window.email;
                input_p.click();
                input_p.value = window.passwd;
                var btn = document.getElementsByClassName("WB_btn_login formbtn_01")[0];
                btn.click();
                console.log("login");
            });
            pagerenderimg(page, "auth_" + email + "_click_login.png");

        } else {
            //点确认
            after_login(page, email);
        }
    };
}
function after_login(page, email) {
    console.log("after_login");
    //显示同意点同意（如果授权过，则不会显示同意）
    var isaready = page.evaluate(function () {
        var btns = document.getElementsByClassName("WB_btn_oauth formbtn_01");
        if (btns.length > 0) {
            var btn = btns[0];
            btn.click();
            console.log("agree");
            return false;
        } else {
            console.log("aready");
            return true;
        }
    });
    isaready ? pagerenderimg(page, "auth_" + email + "_click_agree.png") : pagerenderimg(page, "auth_" + email + "_aready.png");
}

function auth_continue(email, code, callback) {
    console.log("auth_continue")
    var page = taskpages[email];
    page.onConsoleMessage = function () {
        if (arguments[0] == "code") {
            var base64 = taskpages[email].renderBase64('PNG');
            return callback("code", base64);
        }
        if (arguments[0] == "agree") {
            //点击确认授权
            if (taskpages[email]) {
                taskpages[email] = null
            }
            return callback("agree");
        }
        if (arguments[0] == "aready") {
            //点击确认授权
            if (taskpages[email]) {
                taskpages[email] = null
            }
            callback("aready");
        }
    }

    var script1 = "(function(){ window.code='" + code + "' })()";
    page.evaluateJavaScript(script1);

    page.evaluate(function () {
        var input_c = document.getElementsByClassName("WB_iptxt oauth_form_input oauth_form_code")[0];
        input_c.click();
        input_c.value = window.code;
        //点登录
        var btn = document.getElementsByClassName("WB_btn_login formbtn_01")[0];
        btn.click();
        console.log("login");
    });
    pagerenderimg(page, "auth_" + email + "_input_code_" + codenum + ".png");
    setTimeout(function () {
        pagerenderimg(page, "auth_" + email + "_input_code_" + codenum + "_after3s.png");
    }, 3000);
    codenum++;
    page.onLoadFinished = function (status) {
        // setTimeout(function () {
        console.log("continue page.onLoadFinished");
        after_login(page, email);
        // },3000)
    };
}
var port = system.args[1];
var service = server.listen(port, function (request, response) {
    console.log('Request received at ' + new Date());
    response.statusCode = 200;
    console.log("email", request.post.email, "passwd", request.post.passwd, "code", request.post.code);
    var cb = function (status, base64) {
        response.headers = {
            'Cache': 'no-cache',
            'Content-Type': 'text/plain;charset=utf-8'
        };
        if (status == "agree") {
            var info = {"status": "agree"};
            console.log("点击同意");
            response.write(JSON.stringify(info));
            response.close();
        }
        if (status == "aready") {
            var info = {"status": "aready"};
            console.log("已经授权过");
            response.write(JSON.stringify(info));
            response.close();
        }
        if (status == "code") {
            var info = {"status": "code", "imgbase64": base64};
            console.log("需要验证码");
            response.write(JSON.stringify(info));
            response.close();
        }
    }
    //之前登录需要验证码的 业务上要保证存在page 就必须有code 不然有遗漏
    if (!request.post.code) {
        auth_first(request.post.email, request.post.passwd, cb)
    } else {
        auth_continue(request.post.email, request.post.code, cb)
    }
});

