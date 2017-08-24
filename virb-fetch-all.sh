wget --post-data '{"command":"features"}' --header="Content-Type: application/json" -O virb-fetch-all-features.json http://192.168.0.1/virb
wget --post-data '{"command":"status"}' --header="Content-Type: application/json" -O virb-fetch-all-status.json http://192.168.0.1/virb
