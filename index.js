const defaultHosts = "google.com,heroku.com";

const deviceNames = splitAndTrim(process.env.WEMODEVICES || "");
const hosts = splitAndTrim(process.env.WEMOHOSTS || defaultHosts);

const Wemo = require("wemo-client");
const wemo = new Wemo();
const Rx = require("rxjs/Rx");
const ManageDevice = require("./manage-device");
const isConnected = require("./is-connected");
const { logInfo, logError } = require("./logs");

const manageDevice = new ManageDevice();
const deviceStream = new Rx.ReplaySubject(10);
const pingDelay = 60 * 1000; // 1 minute
const resetDelay = 5 * 60 * 1000; // 5 minutes;

let lastReset;
let isNotifiedDisconnection = false;
let isNotifiedConnection = false;

logInfo("*** Wemo Switch Timer ***");
logInfo("+ Devices to monitor:", deviceNames.join(", "));
logInfo("+ Hosts:", hosts.join(", "));

if (deviceNames.length) {
  Rx.Observable.interval(pingDelay)
  .startWith(0)
  .flatMap(async i => {
    return await isConnected(hosts);
  })
  .subscribe(resetDevices, logError);
} else {
  logInfo("NO DEVICE TO MONITOR!!")
}

deviceStream.subscribe(addDevice, logError);

wemo.discover(function(err, deviceInfo) {
  if (err) {
    deviceStream.error(err);
  } else {
    logInfo(
      "Discovered a device:",
      deviceInfo.friendlyName,
      `(${deviceInfo.macAddress})`
    );
    deviceStream.next(deviceInfo);
  }
});

function addDevice(deviceInfo) {
  if (deviceNames.indexOf(deviceInfo.friendlyName) > -1) {

    const client = wemo.client(deviceInfo);
    client.on("error", function(err) {
      logInfo("* Unable to connect to", deviceInfo.friendlyName, err.message);
    });
    client.on("binaryState", function(value) {
      logInfo(
        deviceInfo.friendlyName,
        "(binary) status changed to",
        parseInt(value, 10) ? "On" : "Off"
      );
    });
    
    manageDevice.add(deviceInfo);
  }
}

function resetDevices(status) {
  if (status === false) {
    notifyDisconnection();

    if (isOkToReset(lastReset)) {
      lastReset = new Date().getTime();
      manageDevice.resetAll(20); // turn on device after 20 seconds
    }
  } else {
    notifyConnection();
  }
}

function isOkToReset(lastReset) {
  const now = new Date().getTime();
  return !lastReset || now - lastReset > resetDelay;
}

function timeToReset(lastReset, timeToReset) {
  const totalSeconds = (new Date().getTime() - lastReset - resetDelay) / 1000;
  const minutes = parseInt(totalSeconds / 60, 10);
  const seconds = parseInt(totalSeconds - minutes * 60, 10);

  return `${minutes} minutes ${seconds} seconds to reset`;
}


function notifyConnection() {
  if (!isNotifiedConnection) {
    logInfo("* CONNECTED");
    isNotifiedConnection = true;
    isNotifiedDisconnection = false;
  }
}

function notifyDisconnection() {
  if (!isNotifiedDisconnection) {
    logInfo("* DISCONNECTED");
    isNotifiedConnection = false;
    isNotifiedDisconnection = true;

    // only display time to reset if the last reset within TimeToReset
    if (lastReset && !isOkToReset(lastReset)) {
      logInfo(timeToReset(lastReset, timeToReset));
    }
  }
}

function splitAndTrim(str) {
  return str
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length);
}
