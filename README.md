Web browser client for Garmin VIRB Elite action camera.
----------

Introduction
================

This project is a web browser client for a WiFi enabled action camera Garmin VIRB Elite. The camera emits WiFi network and exposes [JSON based API briefly described on Garmin forum](https://forums.garmin.com/forum/mac-windows-software/windows-software/virb-edit-aa/56554-).

After connecting the computer to the WiFi network emitted by the camera, this client opened in web browser will listen for the available services at the URL `http://192.168.0.1/virb` and will allow the user to control the camera settings, trigger video recording, trigger making a photo, stream the video from the camera, and preview the details of the device.

Enabling the cross origin resource sharing (CORS)
=======================

The client opened in a web browser with default configuration will not be able to communicate with the local IP address `192.168.0.1` because of the same-origin policy. The workaround is to enforce the CORS by overwriting the `Access-Control-*` HTTP headers. There are many ways to achieve it, the suggested workaround is the [CORS Everywhere add-on for Firefox](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/).

Using the client
=================
1. Install the CORS Everywhere add-on in the Firefox, restart the browser and ensure the add-on is activated.
1. Connect the computer to the WiFi network emitted by the camera.
2. Open this client in Firefox, switch on the CORS Everywhere add-on.
3. Once the client is able to connect to the device, an interface allowing to configure available services will be displayed.
