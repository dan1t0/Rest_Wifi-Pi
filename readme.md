# Rest_Wifi-Pi
Very simple API Rest in nodejs to control RaspWifi-Pi: monitor and interactive (asap).


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
- GET /api/**version** -> `1.0.0-beta`

### stats
Information about the system status.
- GET /api/**stats/[subquery]**
 - **dns** -> `{ "dns": "up" }`
 - **dhcp** -> `{ "dhcp": "up" }`
 - **ipforward** -> `{ "ip-forward": "up" }`
 - **hostadp** -> `{ "hostadp": "up" }`
 - **ipTables** -> `{ "ipTables": "up" }`
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

## Issues
- Client online/offline status