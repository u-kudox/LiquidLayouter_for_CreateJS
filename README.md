# LiquidLayouter for CreateJS

LiquidLayouter is a extension library to easily implement a liquid layout in HTML5 canvas using CreateJS.


## Example
	_layouter = createjs.LiquidLayouter.getInstance();
	_layouter.initialize(_stage);
	_layouter.addLayoutObject(_topLeft, "TL");
	_layouter.addLayoutObject(_top, "T", 0, 0);
	_layouter.addLayoutObject(_topRight, "TR", "1", "0");
	_layouter.addLayoutObject(_left, "L", NaN, NaN, true);
	_layouter.addLayoutObject(_right, "R");
	_layouter.addLayoutObject(_bottomLeft, "BL");
	_layouter.addLayoutObject(_bottom, "B");
	_layouter.addLayoutObject(_bottomRight, "BR");
	_layouter.addLayoutObject(_title, "", "0.5", "0.3", false, "widthFollow");
	_layouter.addLayoutObject(_subTitle, "", "0.5", "0.75", false, "widthFollow");
	_layouter.addLayoutObject(_background, "TL", NaN, NaN, false, "fit");
	_layouter.updateLayout();


## Resources
* More information and sample at the [kudox.jp](http://kudox.jp/java-script/createjs-liquidlayout)
* Read the documentation at the [LiquidLayouter for CreateJS API Documentation](http://kudox.jp/reference/liquidlayouter_for_createjs/)


## Contact and bug reports
* [kudox.jp](http://kudox.jp/contact)
* [Twitter](http://twitter.com/u_kudox)


## License
MIT License
