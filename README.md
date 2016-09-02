# What is it?

Creates an animated trail for changes made to the text document.

> It is mostly pointless, but, kinda fun. Maybe.

# Install

* Install via VSCode extensions install.

# Usage

* Ensure it is enabled and then just type.

# Example

![Example](resources/usage.gif)

# Enable/Disable

You can enable/disable the plugin using the command:

* SnakeTrail.Enable
* SnakeTrail.Disable

If you want to re-read any configuration changes, disable then enable.

# Configuration

* You can modify the snake trail color (default / light / dark)
    * `"snakeTrail.color": "0,255,0"`
    * `"snakeTrail.colorLight": "0,255,0"`
    * `"snakeTrail.colorDark": "0,255,0"`
* You can modify the snake trail fade
    * `"snakeTrail.fadeMS": 100`
        * milliseconds
    * `"snakeTrail.fadeStart": 1.0`
        * the starting opacity value (between 0 and 1.0)
    * `"snakeTrail.fadeEnd": 0.2`
        * the final opacity value (between 0 and 1.0)
    * `"snakeTrail.fadeStep": 0.1`
        * the step decrement

# _Open Source_

If you like but want to make changes/improvemnents, please submit PRs rather than forking.