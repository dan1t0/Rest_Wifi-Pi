# Rest_Wifi-Pi
Very simple API Rest in nodejs to control RaspWifi-Pi: monitor and interactive (asap).

## Install
- Clone the repo: `git clone https://github.com/dan1t0/Rest_Wifi-Pi`
- Enter the folder: `cd Rest_Wifi-Pi``
- Install the Node dependencies: `npm i`
- Install external dependencies:
 - TODO
- To develop you also need to have the Grunt client installed globally:`npm i -g grunt-cli`

## Use
- Start the server (port 8080 by default): `node server.js [port_listen]`
- Make a request:
 - URL: [ip]:port/api/**[query]**
 - ie: `curl -ki 127.0.0.1:8080/api/version`


## API
Supported queries, format:
- **[query]** -> `response example`

### version
Version of the API.
- GET /api/**version** -> `0.0.1`

### stats
Information about the system status.
- GET /api/**stats/[subquery]**
 - **dns** -> `{ "dns": "up" }`
 - **dhcp** -> `{ "dhcp": "up" }`
 - **ipforward** -> `{ "ip-forward": "up" }`
 - **hostapd** -> `{ "hostapd": "up" }`
 - **iptables** -> `{ "iptables": "up" }`
 - **wlan** -> `{ "wlan": "up" }`
 - **all** ->
 ```
    {
        "dns": "up",
        "dhcp": "up",
        "ip-forward": "up",
        "hostadp": "up",
        "ipTables": "up",
        "wlan": "up"
    }
```
 - **hoststatus**  ->
 ```
    {
        "hostname": XXX,
        "uptime": "27 days 4 hours 39 mins",
        "kernel": "3.18.8+",
        "ram": { Ram and swap info },
        "net": [{ info about networks interfaces }, ...],
        "temp": 52.45,
        "disk": { disk info }
    }
```

### clients
Information about the clients connected to the AP.
- GET /api/**list/clients** ->
```
    {
        "ip": ip,
        "mac": "00:00:00:00:00:00",
        "vendor": Product,
        "online": false
    }
```

### aps
Scan APs availables.
- GET /api/**list/aps** ->
```
    {
        "mac": "00:00:00:00:00:00",
        "frequency": "2.437 GHz (Channel 6)",
        "quality": "68/70",
        "signal_level": "-42",
        "encryption_key": "on",
        "ssid": "APtest",
        "bitrates": "24 Mb/s; 36 Mb/s; 48 Mb/s; 54 Mb/s",
        "mode": "Master"
    }
```

## Developer guide
- Create a branch with a name including your user and a meaningful word about the fix/feature you're going to implement, ie: "jesusperez/fixdbstatements"
- Use [GitHub pull requests](https://help.github.com/articles/using-pull-requests).
- Conventions:
 - We use [JSHint](http://jshint.com/) and [Crockford's Styleguide](http://javascript.crockford.com/code.html).
 - Please run `grunt contribute` to be sure your code fits with them.

## Issues
- https://github.com/dan1t0/Rest_Wifi-Pi/issues

## Contributors
- https://github.com/dan1t0/Rest_Wifi-Pi/graphs/contributors