'use strict';

const droplit = require('droplit-plugin');
const noble = require('noble');

class BLEPlugin extends droplit.DroplitPlugin {

    constructor() {
        super();

        // In-memory device states
        this.devices = {};
        this.state = '';
        /* eslint-disable camelcase */
        this.services = {
            BinarySwitch: {
                get_switch: this.getSwitch,
                set_switch: this.setSwitch,
                switchOff: this.switchOff,
                switchOn: this.switchOn
            },
            Connectivity: {
                connect: this.connect,
                disconnect: this.disconnect,
                get_status: this.getStatus
            }
        };
        /* es-lint-enable camelcase */

        noble.on('stateChange', state => {
            this.state = state;
            console.log(`noble state: "${state}"`);
            if (this.state === 'poweredOn') {
                console.log('scan started.');
                noble.startScanning();
            }
        });

        noble.on('discover', peripheral => {
            if (peripheral.advertisement.localName === 'LED') {
                console.log(peripheral);
                this.onDeviceInfo({
                    localId: peripheral.id,
                    address: peripheral.address,
                    deviceMeta: {
                        customName: peripheral.advertisement.localName
                    },
                    services: ['Connectivity']
                });
                this.onPropertiesChanged([{ localId: peripheral.id, index: '0', member: 'status', service: 'Connectivity', value: 'online' }]);
                this.devices[peripheral.id] = peripheral;
                peripheral.connect(error => {
                    if (error) return console.log(error);
                });
            }

            peripheral.once('disconnect', () => {
                console.log(`disconnected from: "${peripheral.id}"`)
                this.onPropertiesChanged([{ localId: peripheral.id, index: '0', member: 'status', service: 'Connectivity', value: 'offline' }]);
            });

            peripheral.once('connect', () => {
                console.log(`connected to: "${peripheral.id}"`);
                var uuids = ['19b10000e8f2537e4f6cd104768a1214'];
                setTimeout(() => {
                    // timeout to prevent sending packet too soon
                    peripheral.discoverServices(uuids, (error, services) => {
                        for (var service of services) {
                            if (service.uuid == '19b10000e8f2537e4f6cd104768a1214') {
                                this.onDeviceInfo({
                                    localId: peripheral.id,
                                    address: peripheral.address,
                                    deviceMeta: {
                                        customName: peripheral.advertisement.localName
                                    },
                                    services: ['Connectivity', 'BinarySwitch']
                                });
                                setTimeout(() => {
                                    // timeout to prevent sending packet too soon
                                    service.discoverCharacteristics();
                                    service.once('characteristicsDiscover', characteristics => {
                                        for (var characteristic of characteristics) {
                                            if (characteristic.uuid == '19b10001e8f2537e4f6cd104768a1214') {
                                                peripheral.characteristics = peripheral.characteristics || {};
                                                console.log(peripheral.characteristics);
                                                peripheral.characteristics['BinarySwitch.switch'] = characteristic;
                                                var toggle = true;
                                                characteristic.read((error, data) => {
                                                    // console.log(data, Buffer.alloc(1, 0)); // <Buffer 00>
                                                    // console.log(Buffer.compare(data, Buffer.alloc(1, 0)));
                                                    if (Buffer.compare(data, Buffer.alloc(1, 0)) === 0) {
                                                        this.onPropertiesChanged([{ localId: peripheral.id, member: 'switch', service: 'BinarySwitch', value: 'off' }]);
                                                    } else {
                                                        this.onPropertiesChanged([{ localId: peripheral.id, member: 'switch', service: 'BinarySwitch', value: 'on' }]);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }, 500);
                            }
                        }
                    });
                }, 500);
            });
        });
    }

    discover() {
        // TODO
        // if (this.state === 'poweredOn') {
        //     console.log('scan started.');
        //     noble.startScanning(); // any service UUID, no duplicates
        //     setTimeout(() => {
        //         noble.stopScanning();
        //     }, 2000);
        // }
    }

    dropDevice(localId) {
        // TODO
    }

    // BinarySwitch Implementation
    getSwitch(localId, callback, index) {
        // device does not exist
        if (!this.devices[localId]) {
            callback(undefined);
            return true;
        }

        // Check if indexed
        if (Array.isArray(this.devices[localId])) {
            if (!this.devices[localId][index])
                return true;

            setImmediate(() => { // simulate async
                // send last set value
                callback(this.devices[localId][index]['BinarySwitch.switch']);
            });
            return true;
        }

        setImmediate(() => { // simulate async
            // send last set value
            callback(this.devices[localId]['BinarySwitch.switch']);
        });
        return true;
    }

    setSwitch(localId, value, index) {
        console.log(this.devices)
        // device does not exist
        if (!this.devices[localId])
            return true;

        // check if values are valid
        if (value !== 'on' && value !== 'off')
            return true;

        // Check if indexed
        console.log(this.devices[localId].characteristics);
        if (this.devices[localId].characteristics['BinarySwitch.switch']) {
            this.devices[localId].characteristics['BinarySwitch.switch'].write(value == "off" ? Buffer.alloc(1, 0) : Buffer.alloc(1, 1))
            this.onPropertiesChanged([{ localId: localId, member: 'switch', service: 'BinarySwitch', value: value }]);
        }

    }

    switchOff(localId, value, callback, index) {
        return this.setSwitch(localId, 'off', index);
    }

    switchOn(localId, value, callback, index) {
        return this.setSwitch(localId, 'on', index);
    }

    // Connectivity Implementation
    connect(localId) {
        // TODO
    }

    disconnect(localId) {
        // TODO
    }

    getStatus(localId, callback) {
        // TODO
    }
}

module.exports = BLEPlugin;
