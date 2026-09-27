<p align="center">
  <img src="public/sonar-viewer.svg" alt="Sonar Viewer" width="192">
</p>

# Sonar Viewer

Viewing side scan sonar recordings made easy!

## Features

Sonar Viewer includes the following features:

### General

- Easily view recordings by opening a zip file containing the sonar data.
- Local processing only. No data is uploaded to any server.

### Supported devices

- Humminbird &reg; Solix

### Recording list

- All recordings in the opened files are displayed in a list including a timestamp and duration.

### Recording Viewer

- Scroll through the recording using a timeline just like watching a video.
- All viewers (map, side scan) will display the recording at the selected timeline position

### Side Scan Sonar Viewer

- View the side scan sonar view of the recording
- The boat's position is marked with a boat icon.
- Differing from a real sonar device, the currently selected timeline position is at the center to better match the position with the map view.

### Map View

- Position and heading of boat at current time in recording is marked on the map
- The full track of the boat during the recording is shows as a path
- Pan to current location: Click the location icon to center the map to the current boat location.
- Follow mode: While the map is centered to the boat location, clicking the location button again enters follow mode. While scrolling through the timeline, the boat stays at the center of the map.

## Usage

Using Sonar Viewer is as simple as opening the hosted webapp at [https://doba16.github.io/sonar-viewer](https://doba16.github.io/sonar-viewer) and opening a zip file containing the recordings.

The recording is processed in the browser.
No data is ever uploaded to any server on the internet.

> [!NOTE]
> Sonar Viewer is currently tested with this device:
> - Humminbird &reg; Solix 12

### File Structure

The opened zip file must contain the following files:

```
─ (root folder or sub folders)
  ├ Rec<number1>
  │ ├ B002.SON
  │ └ B003.SON
  ├ Rec<number2>
  │ ├ B002.SON
  │ └ B003.SON
  ├ Rec<number1>.DAT
  └ Rec<number2>.DAT
```

This corresponds to the file structure that is present on the SD card from the device.
The zip file may also contain other files.

## Troubleshooting

### GPS

GPS signals in recordings seem to be off by a few meters.
I was able to calibrate the location based on a test recording of our device in my region.
However, I am not sure if the same calibration works for other devices or in other locations.

## Acknowledgements

The [file structure of Humminbird &reg; recording files](https://cameronbodine.github.io/PINGMapper/docs/advanced/HumFileStructure.html) is described by the [Ping Mapper](https://cameronbodine.github.io/PINGMapper/) project.