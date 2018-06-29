const Wemo = require("wemo-client");
const wemo = new Wemo();
const { logInfo, logError } = require("./logs");

const ManageDevice = (() => {
  function ManageDevice() {
    this.devices = [];
  }

  ManageDevice.prototype.add = function(deviceInfo) {
    // if device exists, remove it then add it again, sometime device is disconnected and got a new IP etc..
    this.devices = this.devices.reduce((acc, obj) => {
      if (obj.deviceInfo.macAddress !== deviceInfo.macAddress) {
        acc.push(obj);
      }
      return acc;
    }, []);

    const client = wemo.client(deviceInfo);
    // client.on("error", function(err) {
    //   logInfo("* Unable to connect to", deviceInfo.friendlyName, err.message);
    // });
    // client.on("binaryState", function(value) {
    //   logInfo("binaryState", deviceInfo.friendlyName, "changed to", parseInt(value, 10) ? "On" : "Off");
    // });
    this.devices.push({
      deviceInfo,
      client
    });
    // it seems the first json from deviceInfo binaryState is 0, then updated later  
    logInfo("Added a device to monitor", deviceInfo.friendlyName, 'current binary state', deviceInfo.binaryState);

    if (parseInt(deviceInfo.binaryState, 10) === 0) {
        client.setBinaryState(1);
        logInfo("Turn ON " + deviceInfo.friendlyName, 'previously was off');
    }
  };

  ManageDevice.prototype.resetAll = function(secondsToTurnOnDeviceAfterReset) {
    if (secondsToTurnOnDeviceAfterReset === void 0) {
      secondsToTurnOnDeviceAfterReset = 30;
    }

    secondsToTurnOnDeviceAfterReset = secondsToTurnOnDeviceAfterReset * 1000; 
    logInfo("Resetting ALL devices...");

    this.devices.forEach(function(device) {
      logInfo("Turn OFF " + device.deviceInfo.friendlyName);
      device.client.setBinaryState(0);

      setTimeout(function() {
        device.client.setBinaryState(1);
        logInfo("Turn ON " + device.deviceInfo.friendlyName);
      }, secondsToTurnOnDeviceAfterReset);
    });
  };

  return ManageDevice;
})();

module.exports = ManageDevice;
