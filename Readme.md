# BLE IoT Gateway

Build your BLE IoT Application with cloud and cellular support!

# Overview

In this repo, an example ble plugin is provided which connects to Arduino 101 boards and allows you to turn on/off the LED through the Droplit.io Rest API.

There are two test applications provides in the `noble-test` folder which allow you to confirm that node can interface with BLE devices.

### Gateway design overview:
* Software Platform: [Droplit.io](https://docs.droplit.io/)
* Hardware Platform: [Raspberry Pi Zero W](https://www.raspberrypi.org/products/raspberry-pi-zero-w/)
* Gateway Software: [Droplit.io Edge](https://github.com/droplit/droplit.io-edge)
* Downstream Devices: Arduino BLE devices ([Arduino 101](https://store.arduino.cc/usa/arduino-101))
* Connectivity: [Hologram Nova](https://store.arduino.cc/usa/arduino-101)
> Other hardware devices that [Noble](https://github.com/sandeepmistry/noble) and [Droplit.io Edge](https://github.com/droplit/droplit.io-edge) supports are also acceptable, such as other Raspberry Pi devices with BLE radios. 


# Starting from scratch

Before you fire up your Raspberry Pi and Arduino's, get familiar with the Droplit.io Platform by looking through the [documentation](https://docs.droplit.io/) and create a free developer account on the [droplit.io developer portal](https://portal.droplit.io). In the portal, there a few guides/tutorials to get you started.

# Setting up your downstream device (Arduino 101)

You can use any BLE device as a downstream device, including the Arduino 101.

Arduino provides a getting started guide [here](https://www.arduino.cc/en/Guide/Arduino101).

After installing the board support package through the Arduino IDE and selecting Arduino 101 as your board target.

![101 select](/images/101select.png)

Upload the `LED` example to the Arduino 101.


![101 test](/images/101sketch.png)

You can test the Arduino 101 by sending `0x00` and `0x01` data through the nRF Connect mobile app to turn on and off the Arduino 101's user accessable LED .

![nrf connect](/images/nrfconnect.jpg)

# Setting up the hardware.

Before using a cellular connection, you may want to test the Raspberry Pi on a local network connection.
> On the Raspberry Pi Zero W, you may encounter connectivity issues when using both WiFi and Bluetooth at the same time.

First make sure your Raspbery Pi has NodeJs installed. You can install node by following this guide [here](https://docs.droplit.io/docs/install-nodejs-on-linux). You will need the `arm-v6` release of node.

After installing node, make sure you [configure the npm global install directory](https://docs.droplit.io/docs/install-nodejs-on-linux#installing-node-modules-globally-linux-desktop-emb).

# Testing BLE
There are two test applications provides in the `noble-test` folder.

To run the tests, from your gateway device run
```
cd noble-test
npm install
node test
```

This first test will simply scan for ble devices and log the output to the console.

The second test will connect the Raspberry Pi Zero to an Arduino 101 that is running the `BLE` example from above.

# Running Droplit.io Edge Software

Once you have node installed, get the [Droplit.io Edge](https://github.com/droplit/droplit.io-edge) by following its documentation in the repo's readme.

# Installing the ble plugin

Once you have a running instance of the Droplit.io Edge. First teardown the project by running:

```
gulp teardown
```

Then replace the `{droplit-edge}/projects.json` and `{droplit-edge}/projects/droplit-edge/localsettings.json` with the files proviced in `/droplit-ble-plugin`.

You will need to enter your Droplit.io Ecosystem Id in `localsettings.json`.

Next copy the `/droplit-ble-plugin/droplit-edge-sample-ble-plugin` into `{droplit-edge}/projects/`. Then rebuild the project.

```
gulp setup
gulp build
gulp debug
```

In the droplit.io portal, when your Arudino 101 connects, you should be able to controll its led by setting the `BinarySwitch.switch` value or calling `BinarySwitch.switchOn()` / `BinarySwitch.switchOff()`.

![portal](/images/portal.png)

[See it in action here](https://youtu.be/E2czFbtm1LA)
