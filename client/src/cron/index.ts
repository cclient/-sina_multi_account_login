///<TypeScriptExperimentalAsyncFunctions>true</TypeScriptExperimentalAsyncFunctions>
/// <reference path='../../typings/cron/cron.d.ts' />
'use strict';

var CronJob = require('cron').CronJob;
var JTask = require('../utils/ITask');

var JsinaRefreshToken = require('./sinaRefreshToken');

var cronList = {
    '0 * * * * *': [
        {name: "sinaRefreshToken", run: JsinaRefreshToken.refreshAllAccountUntilAllSuccess, para: {arg1: "arg1"}},
    ],
};

var jobs = [];
for (let schedule in cronList) {
    let taskList = cronList[schedule];
    for (let i = taskList.length; i--;) {
        let task = new JTask(taskList[i].name, taskList[i].run.bind(null, taskList[i].para || []));
        jobs.push(new CronJob(schedule, task.start.bind(task)));
    }
}
function run() {
    for (var i = jobs.length; i--;) {
        jobs[i].start();
    }
}

module.exports.run = run
module.exports.stop = function () {
    for (var i = jobs.length; i--;) {
        jobs[i].stop();
    }
};
if (!module.parent) {
    run();
}
