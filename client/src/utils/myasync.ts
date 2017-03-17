///<TypeScriptExperimentalAsyncFunctions>true</TypeScriptExperimentalAsyncFunctions>
/// <reference path='../../typings/node/node.d.ts' />

'use strict';
var whilst = async function (test, callback) {
    while (test()) {
        try {
            await callback();
        } catch (err) {
            console.log("async whilst err " + err)
        }
    }
    return "success"
};

module.exports.whilst = whilst
