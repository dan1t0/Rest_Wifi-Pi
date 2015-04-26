Rest_Wifi-Pi

Very simple API Rest in nodejs to control RaspWifi-Pi: monitor and interactive (asap). 


curl -ki ip:port/api?stats=[query]

[query]
dns         -> {"dns":"up"}
dhcp        -> {"dhcp":"up"}
ipforward   -> {"ip-forward":"up"}
hostadp     -> {"hostadp":"up"}
ipTables    -> {"ipTables":"up"}
wlan        -> {"wlan":"up"}
all         -> {"dns":"up","dhcp":"up","ip-forward":"up",
                "hostadp":"up","ipTables":"up","wlan":"up"}


curl -ki ip:port/api?list=clients

output: json with clients (ip and mac) connected to AP of wlan0 (asap with info about vendor based on MAC address and online status)