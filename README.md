### Firebase remote config watch dog

Based on https://github.com/eBay/firebase-remote-config-monitor

The main difference you can run this project without cloud fuctions.

### Docker

docker build . -t firebase-rc-watch-dog

docker run -d firebase-rc-watch-dog


### Common mistakes

Permission denied fetching Google Analytics data

https://github.com/firebase/firebase-admin-node/issues/1015