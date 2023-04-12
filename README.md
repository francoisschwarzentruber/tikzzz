# [tikzzz](https://github.com/francoisschwarzentruber/tikzzz/)

**tikzzz** is a tiny tikz editor in the browser.
- when you write your tikz code, the image is updated ;
- When you move nodes with the mouse, the code is updated.

> It is inspired by [QTikZ](https://linuxx.info/qtikz/) and [KTikZ](https://userbase.kde.org/KtikZ).

## Screenshot

![image](https://user-images.githubusercontent.com/43071857/204097889-28da69a8-6b9d-416c-9e96-096dbdadaf92.png)


## Setup

You may install this software on your own machine. To this aim, you may run the script `./setup.sh` on an Ubuntu machine:

```bash
$ ./setup.sh
```


In you have another type of systems, do not hesitate to look into `./setup.sh` and to adapt it to your needs.

To sum up you need to install:
- `php7.2-cli` to be able to communicate with php
- `pdf2svg` in order to be able to convert a pdf into an SVG
- `texlive` to get LaTEX
- `texlive-pictures` to get tikz packages
- `texlive-latex-extra` in order to get the standalone LaTEX package


## How to launch it?

Use this Shell script [runlocally.sh](runlocally.sh):
```bash
$ ./runlocally.sh
```
It should open your browser to http://127.0.0.1:8123/, if not you can copy-paste the link or click on it.

## License
Written by [François Schwarzentruber](https://github.com/francoisschwarzentruber/)
Thanks to https://github.com/ysahil97/tikz-to-yed-graphml/blob/master/tikz2graphml/grammar/Tikz.g4
