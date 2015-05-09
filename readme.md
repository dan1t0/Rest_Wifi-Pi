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
- [API](docs/API.md)

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