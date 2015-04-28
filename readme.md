# Rest_Wifi-Pi

Very simple API Rest in nodejs to control RaspWifi-Pi: monitor and interactive (asap). 

node server.js [port_listen] (or 8080 by default)


curl -ki ip:port/api/stats/[query]

[query]
- dns         -> {"dns":"up"}
- dhcp        -> {"dhcp":"up"}
- ipforward   -> {"ip-forward":"up"}
- hostadp     -> {"hostadp":"up"}
- ipTables    -> {"ipTables":"up"}
- wlan        -> {"wlan":"up"}
- all         -> {"dns":"up","dhcp":"up","ip-forward":"up",
                "hostadp":"up","ipTables":"up","wlan":"up"}

curl -ki ip:port/api/list/clients
- clients     -> { "ip": ip,
	   "mac": "00:00:00:00:00:00",
	   "vendor": Product,
	   "online": false }

output: json with clients (ip and mac) connected to AP of wlan0 (or other interface) (asap: client online/offline status)
