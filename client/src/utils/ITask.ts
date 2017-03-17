///<TypeScriptExperimentalAsyncFunctions>true</TypeScriptExperimentalAsyncFunctions>
/// <reference path='../../typings/node/node.d.ts' />

'use strict';

var jobstatus = require("./JobStatus");

interface ITask {
    start();
    end(): void;
}

class Task implements ITask {
    private _jobName: string;
    private _isRunning: boolean;
    private _run: any

    constructor(name: string, run: any) {
        this._isRunning = false;
        this._jobName = name;
        this._run = run
    }

    public start() {
        let self = this;
        let status = jobstatus.GetStatus(self._jobName);
        console.log(self._jobName + " status " + status + " " + (new Date()).toString());
        if (!status) {
            jobstatus.Start(self._jobName);
            self._isRunning = true;
            return self._run()
                .then(function (info) {
                    console.log(self._jobName + " success");
                    self.end()
                }).catch(function (info) {
                    console.log(self._jobName + " fail " + JSON.stringify(info));
                    self.end()
                })
        } else {
            return;
        }
    }

    public end() {
        let self = this
        jobstatus.End(self._jobName);
        if (this._isRunning) {
            this._isRunning = false;
            console.log(this._jobName + " end");
        }
    }
}

module.exports = Task

