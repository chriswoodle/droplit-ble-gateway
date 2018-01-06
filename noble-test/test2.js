var noble = require('noble');
noble.on('stateChange', state => {
    if (state === 'poweredOn') {
        console.log('scan started.');
        noble.startScanning(); // any service UUID, no duplicates
    }
});

noble.on('discover', peripheral => {

    if (peripheral.advertisement.localName === 'LED') {
        console.log(peripheral);
        peripheral.connect(error => {
            if (error) return console.log(error);

        });
        peripheral.once('connect', () => {
            console.log('connected');
            var uuids = ['19b10000e8f2537e4f6cd104768a1214'];
            setTimeout(() => {
                peripheral.discoverServices(uuids, (error, services) => {
                    console.log(services)
                    for (var service of services) {
                        if (service.uuid == '19b10000e8f2537e4f6cd104768a1214') {
                            console.log(service);
                            service.discoverCharacteristics();
                            service.once('characteristicsDiscover', characteristics => {
                                for (var characteristic of characteristics) {
                                    if (characteristic.uuid == '19b10001e8f2537e4f6cd104768a1214') {
                                        console.log(characteristic);
                                        var toggle = true;
                                        setInterval(() => {
                                            let value = toggle ? Buffer.alloc(1, 0) : Buffer.alloc(1, 1);
                                            characteristic.write(value);
                                            toggle = !toggle;
                                        }, 1000)
                                    }
                                }
                            });

                        }
                    }
                });
            }, 500)

        });
    }
});

noble.on('warning', message => {
    console.log('warning:', message)
});
