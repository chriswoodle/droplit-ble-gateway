var noble = require('noble');
noble.on('stateChange', (state) => {
    console.log(state);
    if (state === 'poweredOn') {
        noble.startScanning(); // any service UUID, no duplicates
    }
}); 

noble.on('discover', (peripheral) => {
    console.log(peripheral);
});
