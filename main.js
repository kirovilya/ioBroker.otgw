/**
 *
 * otgw adapter
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
const otgw = require('./lib/otg_api');
let otgwapi;
const adapter = new utils.Adapter('otgw');

adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});


adapter.on('ready', function () {
    main();
});

function debugToAdapter(data) {
    adapter.log.debug(data.msg);
}

function onConnect(data) {
    adapter.log.debug('Result of connect', data);
    if (data.found) {
        adapter.log.debug(`Connected to ${data.ip}:${data.port} verison ${data.version}`);
        adapter.setState('info.connection', true);
    } else {
        otgwapi.closePort();
            otgwapi = undefined;
        adapter.setState('info.connection', false);
        adapter.log.error(`Can not connect to gateway`);
    }
}


function main() {
	const host = adapter.config.host;
	const port = adapter.config.port;
	if (host && port) {
    	adapter.log.info(`Start conncet to ${host}:${port}`);
    	otgwapi = new otgw();
        otgwapi.setDebug(3); // APP & API
		otgwapi.on('debug', debugToAdapter);
		otgwapi.on('found', onConnect);
        otgwapi.openPort(host, Number(port));
    } else {
    	adapter.log.error('Empty host or port. Please configure adapter first.');
    }
}
