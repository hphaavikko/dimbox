# Change Log
This is the changelog for [DimBox](https://dimboxjs.com).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.4] - 2024-12-14
### Added
- Parameter currentEl to callback function calls onBeforeUpdateContent, onAfterUpdateContent and onContentLoaded.

## [1.1.3] - 2024-11-16
### Added
- Data attribute data-dimbox-download-file.

### Changed
- Renamed function downloadRemoteImage to downloadRemoteFile.

## [1.1.2] - 2024-09-12
### Fixed
- Fix closing DimBox on esc key press with single content.

## [1.1.1] - 2024-09-11
### Added
- Close DimBox on esc key press.

## [1.1.0] - 2024-07-05
### Added
- Fullscreen functionality.
- Event hooks onAfterEnterFullscreen, onAfterExitFullscreen, onBeforeEnterFullscreen and onBeforeExitFullscreen.
- Config options fullscreen, showFullscreenButton, svgFullscreenButton and svgFullscreenExitButton.

## [1.0.6] - 2024-07-01
### Added
- Error message on XHR error when loading ajax content.

## [1.0.5] - 2024-06-30
### Added
- Support for downloading files from a different domain (Access-Control-Allow-Origin header needs to be set on the remote server).

## [1.0.4] - 2024-06-22
### Added
- Option preventScroll: true to focusing the clicked element on DimBox close.

## [1.0.3] - 2023-09-11
### Added
- Add focus trapping when DimBox is open.

## [1.0.2] - 2023-05-29
### Changed
- Add init to public methods.

## [1.0.1] - 2023-02-03
### Added
- Add repository to package.json.

## [1.0.0] - 2023-01-03
- First release.
