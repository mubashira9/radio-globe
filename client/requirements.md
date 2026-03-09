## Packages
react-globe.gl | 3D Interactive Globe visualization for radio stations
three | Peer dependency required for react-globe.gl
framer-motion | Fluid animations for UI panels and page transitions

## Notes
Radio Browser API is used for fetching global stations (https://de1.api.radio-browser.info).
The globe uses external textures from unpkg.com for the Earth visualization.
Audio streaming relies on HTML5 Audio; some stations may have CORS or mixed-content issues depending on the browser, which is expected for live radio URLs.
