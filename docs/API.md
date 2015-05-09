# API

Supported queries, format:
- **[query]** -> `response example`

## version
Version of the API.
- GET /api/**version** -> `0.0.1`

## stats
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

## clients
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

## aps
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

## help
Print the app's help.
- GET /api/**help**
