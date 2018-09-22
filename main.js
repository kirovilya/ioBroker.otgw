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

function onUpdate(name, value) {
    updateState(name, value);
}


function updateState(name, value, common) {
    let new_common = {name: name};
    let id = name;
    if (common != undefined) {
        if (common.name != undefined) {
            new_common.name = common.name;
        }
        if (common.type != undefined) {
            new_common.type = common.type;
        }
        if (common.unit != undefined) {
            new_common.unit = common.unit;
        }
        if (common.states != undefined) {
            new_common.states = common.states;
        }
        if (common.read != undefined) {
            new_common.read = common.read;
        }
        if (common.write != undefined) {
            new_common.write = common.write;
        }
        if (common.role != undefined) {
            new_common.role = common.role;
        }
        if (common.min != undefined) {
            new_common.min = common.min;
        }
        if (common.max != undefined) {
            new_common.max = common.max;
        }
        if (common.icon != undefined) {
            new_common.icon = common.icon;
        }
    }
    // check if state exist
    adapter.getObject(id, function(err, stobj) {
        if (stobj) {
            // update state - not change name and role (user can it changed)
            delete new_common.name;
            delete new_common.role;
        }
        adapter.extendObject(id, {type: 'state', common: new_common});
        adapter.setState(id, value, true);
    });
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
        otgwapi.on('update', onUpdate);
        otgwapi.openPort(host, Number(port));
    } else {
    	adapter.log.error('Empty host or port. Please configure adapter first.');
    }
}
