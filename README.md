# truetype-font-to-bitmapfont-converter
Very simple Truetype / Opentype font to bitmap font converter

## How to use
* Go to the <a href="https://www.youtube.com/watch?v=B-XRJ9EGsoQ">Github Page</a><br>
* Select a ttf/otf/woff font to get a preview and start the process.<br>
* Adjust offset, font size and canvas size as needed.<br>
* Save bitmaps and data (csv format with comma separator)<br>

Canvas(es) will be transparent when exported.<br>
<b>Note: </b> You can adjust the size of the character while it's being drawn on the canvas.<br>
<b>Another note: </b> If your font doesn't have a character in particular that you want to add, you can do it by clicking on the respective button.
<br>
<br>
There are some extra stuff in the page but i'm sure you'll figure them out, i'm too lazy to explain, heh...

## Running it locally
* Download and install <a href="https://www.npmjs.com/package/lite-server">lite-server</a> (npm -gi lite-server)<br>
* Download and extract this repository in a folder in your computer
* Open the command line prompt in the current folder and run <code>lite-server</code>

## Third-party libs
This project uses opentype.js, a JavaScript parser and writer for TrueType and OpenType fonts.<br>
https://github.com/opentypejs/opentype.js/
