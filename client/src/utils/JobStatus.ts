///<TypeScriptExperimentalAsyncFunctions>true</TypeScriptExperimentalAsyncFunctions>
/// <reference path='../../typings/node/node.d.ts' />
'use strict';
class JobStatus {
    private _statusmap

    public constructor() {
        this._statusmap = new Map()
    }

    public Start(name: string): void {
        this._statusmap.set(name, true)
    };

    public End(name: string): void {
        this._statusmap.set(name, false)
    };

    public GetStatus(key: string): string {
        return this._statusmap.get(key)
    }
}
module.exports = new JobStatus()
