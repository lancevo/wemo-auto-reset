# Auto-reset Wemo switches when there is no internet connection

My cable modem needs to reset frequently. So I bought a Wemo switch to recycle the power of my cable modem. This script pings a list of IPs or websites every minute to determine if the internet connection is still up. When it's disconnected, it turns off the Wemo switches, and turns them back on in 20 seconds, to recycle power of the devices. There is a 5 minutes delay between each recycle.

### Install

```bash
git clone https://github.com/lancevo/wemo-auto-reset.git
cd wemo-auto-reset
npm install
```

### Run the script

Replace `WEMOHOSTS` string with IP addresses and host names (comma separated) that won't block your IP 
if it keeps pinging. The host name is randomly pinged.


Replace `WEMODEVICES` string with device names (comma separated as well) 

```bash
WEMOHOSTS="google.com,heroku.com" WEMODEVICES="Wemo Mini 1" node index.js
```

### Run as a background service with forever

Install `forever`

```bash
npm install -g forever
```

Run it and save output to a log file

```bash
WEMOHOSTS="google.com,heroku.com" WEMODEVICES="Wemo Mini 1" forever start index.js -o wemo-log.txt
```