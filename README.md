virb-control
================

Web browser client for the VIRB Elite Wireless API.

Introduction
----------------

This project is a web browser client for the VIRB Elite Wireless API. The Garmin VIRB Elite action camera emits a WiFi network and exposes a JSON based API. [The outline of how the API works can be found on the Garmin forum](https://forums.garmin.com/forum/mac-windows-software/windows-software/virb-edit-aa/56554-).

The client opened in a web browser on a computer or other device connected to the WiFi emitted by the camera will listen for the available services at the URL `http://192.168.0.1/virb` and will allow the user to control the camera settings, trigger video recording, trigger making a photo, stream the video from the camera, and preview the details of the device.

Enabling the cross origin resource sharing (CORS)
----------------

The client opened in a web browser with default configuration will not be able to communicate with the local IP address `192.168.0.1` because of the same-origin policy. The workaround is to exceptionally run the web browser in mode with the policy disabled.

### Firefox

Enforce the CORS by overwriting the `Access-Control-*` HTTP headers. There are many ways to achieve it, the suggested workaround is the [CORS Everywhere add-on for Firefox](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/).

#### Using the client in Firefox

1. Install the CORS Everywhere add-on in the Firefox, restart the browser and ensure the add-on is activated.
2. Connect the computer to the WiFi network emitted by the camera.
3. Open this client in Firefox.
4. Switch on the CORS Everywhere add-on.
5. Once the client is able to connect to the device, an interface allowing to configure available services will be displayed.

### Chrome/Chromium

Run the web browser with the `--disable-web-security` flag enabled. To ensure the web browser instance is launched with the flag enabled, it's necessary to kill all Chrome/Chromium processes beforehand.

`chromium --disable-web-security virb-control.html`

#### Using the client in Chrome/Chromium

1. Ensure no instances of web browser are running.
2. Launch the web browser from command line with the flag `--disable-web-security`.
3. Connect the computer to the WiFi network emitted by the camera.
4. Open this client in the web browser.
5. Once the client is able to connect to the device, an interface allowing to configure available services will be displayed.

Enabling the ECMAScript 6 modules
----------------

This application is using native ECMAScript 6 modules.

### Firefox

To enable the support for EC6 modules in older versions of Firefox, go to the browser settings (`about:config`) and set the settings item `dom.moduleScripts.enabled` to `true`.
