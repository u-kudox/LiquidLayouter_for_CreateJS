/*
LiquidLayouter for CreateJS
Version: 1.10
Author: kudox
http://kudox.jp/
http://twitter.com/u_kudox
Licensed under the MIT License
Copyright (c) 2012 kudox.jp
*/

/**
* @namespace createjs
**/
this.createjs = this.createjs || {};

(function(window) {

	var HALF = 0.5;
	var _isInternalAccess = false;
	var _instance;
	var _initialized = false;
	var _isOrientationDevice = false;
	var _canvas;
	var _stage;
	var _defaultWidth;
	var _defaultHeight;
	var _drawingAreaRect;
	var _layoutObjects = [];

	/**
	* LiquidLayouterは、CreateJSを使ったHTML5 canvasのリキッドレイアウトをより簡単に実装するための拡張ライブラリです。LiquidLayouterは、Singletonクラスです。インスタンスを生成するには、コンストラクタではなくcreatejs.LiquidLayouter.getInstance()を使用して下さい。
	* @class LiquidLayouter
	* @constructor
	**/
	function LiquidLayouter() {
		if (!_isInternalAccess) {
			throw new Error("LiquidLayouter is Singleton Class. Please call 'LiquidLayouter.getInstance()'.");
		}
		_isInternalAccess = false;
	}

	/**
	* LiquidLayouterインスタンスを取得します。LiquidLayouterはSingletonクラスであるため、異なる場所で取得しても必ず同じインスタンスが返されます。
	* @static
	* @method getInstance
	* @return {LiquidLayouter} LiquidLayouterインスタンス。
	**/
	LiquidLayouter.getInstance = function() {
		if (_instance) {
			return _instance;
		}
		_isInternalAccess = true;
		_instance = new LiquidLayouter();
		return _instance;
	};

	var p = LiquidLayouter.prototype = {
	};

	/**
	* LiquidLayouterが、initialize()により初期化されているかをBool値で返します。
	* @method getInitialized
	* @return {Boolean} LiquidLayouterが初期化されているかを示すBool値。
	**/
	p.getInitialized = function() {
		return _initialized;
	};

	/**
	* Stageインスタンスの参照を返します。
	* @method getStage
	* @return {Stage} Stageインスタンスの参照。
	**/
	p.getStage = function() {
		return _stage;
	};

	/**
	* canvas要素の参照を返します。
	* @method getCanvas
	* @return {HTMLCanvasElement} canvas要素の参照。
	**/
	p.getCanvas = function() {
		return _canvas;
	};

	/**
	* 現在のcanvas.widthの値を返します。
	* @method getStageWidth
	* @return {Number} 現在のcanvas.widthの値。
	**/
	p.getStageWidth = function() {
		return _canvas.width;
	};

	/**
	* 現在のcanvas.heightの値を返します。
	* @method getStageHeight
	* @return {Number} 現在のcanvas.heightの値。
	**/
	p.getStageHeight = function() {
		return _canvas.height;
	};

	/**
	* LiquidLayouterがレイアウトを行う範囲を示すRectangleを返します。このRectangleが示すのはcanvasの描画領域ではありません。例えば、canvas.widthが1600であっても、maxWidthが1200に設定されていれば、widthは1200となります。また、removeResizeListener()を呼んだ場合は、更新が行われないので最後に更新された値となります。
	* @method getDrawingAreaRect
	* @return {Rectangle} LiquidLayouterがレイアウトを行う範囲を示すRectangleオブジェクト。
	**/
	p.getDrawingAreaRect = function() {
		return _drawingAreaRect;
	};

	/**
	* Stageの配置を指定する値です。StageAlignクラスの定数が使用できます。initialize()の第2引数で指定することができますが、minWidth, minHeight, maxWidth, maxHeightのいずれかが指定されていなければ、指定する意味はありません。
	* @property align
	* @type String
	* @default ""
	**/
	p.align = "";

	/**
	* レイアウトにおけるStage幅の最小値です。initialize()の第3引数で指定することができます。例えば、この値を800に設定した場合、canvas.widthが800未満になった場合でもLiquidLayouterは800として処理します。
	* @property minWidth
	* @type Number
	* @default 0
	**/
	p.minWidth = 0;

	/**
	* レイアウトにおけるStage高さの最小値です。initialize()の第4引数で指定することができます。例えば、この値を600に設定した場合、canvas.heightが600未満になった場合でもLiquidLayouterは600として処理します。
	* @property minHeight
	* @type Number
	* @default 0
	**/
	p.minHeight = 0;

	/**
	* レイアウトにおけるStage幅の最大値です。initialize()の第5引数で指定することができます。例えば、この値を1600に設定した場合、canvas.widthが1600を超えた場合でもLiquidLayouterは1600として処理します。
	* @property maxWidth
	* @type Number
	* @default 0
	**/
	p.maxWidth = 0;

	/**
	* レイアウトにおけるStage高さの最大値です。initialize()の第6引数で指定することができます。例えば、この値を1200に設定した場合、canvas.heightが1200を超えた場合でもLiquidLayouterは1200として処理します。
	* @property maxHeight
	* @type Number
	* @default 0
	**/
	p.maxHeight = 0;

	/**
	* trueを指定することで、canvas.widthの値を固定することができます。ブラウザウィンドウの大きさによってcanvasの高さだけを変更したい場合、initialize()よりも前にtrueを指定しておきます。
	* @property fixedWidth
	* @type Boolean
	* @default false
	**/
	p.fixedWidth = false;

	/**
	* trueを指定することで、canvas.heightの値を固定することができます。ブラウザウィンドウの大きさによってcanvasの幅だけを変更したい場合、initialize()よりも前にtrueを指定しておきます。
	* @name fixedHeight
	* @type Boolean
	* @default false
	**/
	p.fixedHeight = false;

	/**
	* Tweenが使用可能かを示すBool値です。orientationchangeイベントをサポートしているデバイスで且つTween.jsが読み込まれていれば、自動的にtrueになります。orientationchangeイベントをサポートしていない環境やTween.jsが読み込まれていない環境ではtrueを指定しても効果はありません。
	* @property tweenEnabled
	* @type Boolean
	* @default false
	**/
	p.tweenEnabled = false;

	/**
	* Tweenを使用する場合の所要時間です。
	* @property tweenTime
	* @type Number
	* @default 1000
	**/
	p.tweenTime = 1000;

	/**
	* Tweenを使用する場合のイージングです。
	* @property tweenEase
	* @type Object
	* @default Ease.quintOut
	**/
	p.tweenEase;

	/**
	* LiquidLayouterインスタンスを初期化します。第2引数以降は省略可能です。
	* @method initialize
	* @param stage {Stage} Stageインスタンスの参照。
	* @param [align=""] {String} Stageの配置を指定する文字列。StageAlignクラスの定数が使用できます。省略可能で初期値は""。
	* @param [minWidth=0] {Number} Stage幅の最小値。省略可能で初期値は0。
	* @param [minHeight=0] {Number} Stage高さの最小値。省略可能で初期値は0。
	* @param [maxWidth=0] {Number} Stage幅の最大値。省略可能で初期値は0。
	* @param [maxHeight=0] {Number} Stage高さの最大値。省略可能で初期値は0。
	**/
	p.initialize = function(stage, align, minWidth, minHeight, maxWidth, maxHeight) {
		if (_initialized) {
			throw new Error("LiquidLayouter has already been initialized.");
			return;
		}
		if (!(stage instanceof createjs.Stage)) {
			throw new Error(stage + " is not createjs.Stage instance.");
		}
		_initialized = true;
		_stage = stage;
		_canvas = stage.canvas;
		_defaultWidth = _canvas.width;
		_defaultHeight = _canvas.height;
		this.align = align || "";
		this.minWidth = minWidth || 0;
		this.minHeight = minHeight || 0;
		this.maxWidth = maxWidth || 0;
		this.maxHeight = maxHeight || 0;
		if ("onorientationchange" in window) {
			_isOrientationDevice = true;
			if (createjs.Tween) {
				this.tweenEnabled = true;
				if (!this.tweenEase) {
					this.tweenEase = createjs.Ease.quintOut;
				}
			}
		}
		this.addResizeListener();
		updateCanvasSize();
		updateDrawingAreaRect();
	};

	/**
	* リキッドレイアウトで配置したいobjectを登録します。
	* @method addLayoutObject
	* @param object {DisplayObject} objectの参照。objectはDisplayObjectを継承している必要があります。
	* @param [align=""] {String} objectを配置する位置を指定します。StageAlignクラスの定数を使用することができます。
	* @param [x=undefined] {Number | String} 第2引数のalignの位置から見た相対x座標。省略またはNaNを指定した場合は、objectの現在の座標値から相対座標が自動的に計算されます。数値を文字列で指定した場合は、Stageの幅を"1"とした比率となります。
	* @param [y=undefined] {Number | String} 第2引数のalignの位置から見た相対y座標。省略またはNaNを指定した場合は、objectの現在の座標値から相対座標が自動的に計算されます。数値を文字列で指定した場合は、Stageの高さを"1"とした比率となります。
	* @param [rounded=false] {Boolean} 座標値を整数に丸めるかをBool値で指定します。省略可能で初期値はfalse。
	* @param [sizeFollowRule=SizeFollowRule.NONE] {String} ステージサイズの変更に伴ってobjectのサイズを変更する際のルールをSizefollowRuleクラスの定数で指定します。省略した場合は、初期値のSizeFollowRule.NONEとなり、サイズ変更処理は行われません。
	* @param [scaleX=object.scaleX] {Number} object.scaleXの初期値です。省略またはNaNを指定した場合は、objectの現在のscaleXの値となります。
	* @param [scaleY=object.scaleY] {Number} object.scaleYの初期値です。省略またはNaNを指定した場合は、objectの現在のscaleYの値となります。
	**/
	p.addLayoutObject = function(object, align, x, y, rounded, sizeFollowRule, scaleX, scaleY) {
		if (!_initialized) {
			throw new Error("LiquidLayouter instance has not been initialized.");
		}
		if (!(object instanceof createjs.DisplayObject)) {
			throw new Error(object + " does not inherit from createjs.DisplayObject.");
		}
		var index = getIndexOfObject(_layoutObjects, object);
		if (index !== -1) {
			throw new Error("LiquidLayouter has the object already.");
		}
		align = align || "";
		if (typeof x === "string") {
			if (isNaN(Number(x))) {
				throw new Error('"' + x + '"' + " can not be converted to a number.");
			}
		} else if (isNaN(x)) {
			x = this.getRelativeX(align, object.x);
		}
		if (typeof y === "string") {
			if (isNaN(Number(y))) {
				throw new Error('"' + y + '"' + " can not be converted to a number.");
			}
		} else if (isNaN(y)) {
			y = this.getRelativeY(align, object.y);
		}
		rounded = rounded || false;
		sizeFollowRule = sizeFollowRule || SizeFollowRule.NONE;
		scaleX = scaleX || object.scaleX;
		scaleY = scaleY || object.scaleY;
		_layoutObjects.push(new LayoutObject(object, align, x, y, rounded, sizeFollowRule, scaleX, scaleY));
	};

	/**
	* LiquidLayouterに登録したobjectをLayoutObjectとして取得します。このLayoutObjectを通して、addLayoutObject()で登録したプロパティを変更することができます。
	* @method getLayoutObject
	* @param object {DisplayObject} objectの参照。
	* @return {Object} LayoutObjectの参照。
	**/
	p.getLayoutObject = function(object) {
		var index = getIndexOfObject(_layoutObjects, object);
		if (index !== -1) {
			return _layoutObjects[index];
		} else {
			return null;
		}
	};

	/**
	* LiquidLayouterに登録したobjectを削除します。LiquidLayouterは、登録したobjectの参照を保持しています。不要になったobjectは、必ずremoveLayoutObject()で削除するようにして下さい。
	* @method removeLayoutObject
	* @param object {DisplayObject} objectの参照。
	**/
	p.removeLayoutObject = function(object) {
		var index = getIndexOfObject(_layoutObjects, object);
		if (index !== -1) {
			_layoutObjects.splice(index, 1);
		}
	};

	/**
	* 第1引数で指定された位置から見た相対x座標を返します。
	* @method getRelativeX
	* @param align {String} 相対座標の基準となる位置。StageAlignクラスの定数を使用することができます。
	* @param x {Number} x座標値。
	* @return {Number} 相対x座標値。
	**/
	p.getRelativeX = function(align, x) {
		switch (align) {
			case StageAlign.TOP_LEFT :
			case StageAlign.LEFT :
			case StageAlign.BOTTOM_LEFT :
				break;
			case StageAlign.TOP_RIGHT :
			case StageAlign.RIGHT :
			case StageAlign.BOTTOM_RIGHT :
				x = x - _defaultWidth;
				break;
			case StageAlign.TOP :
			case StageAlign.BOTTOM :
			default :
				x = x - _defaultWidth * HALF;
				break;
		}
		return x;
	};

	/**
	* 第1引数で指定された位置から見た相対y座標を返します。
	* @method getRelativeY
	* @param align {String} 相対座標の基準となる位置。StageAlignクラスの定数を使用することができます。
	* @param y {Number} y座標値。
	* @return {Number} 相対y座標値。
	**/
	p.getRelativeY = function(align, y) {
		switch (align) {
			case StageAlign.TOP :
			case StageAlign.TOP_LEFT :
			case StageAlign.TOP_RIGHT :
				break;
			case StageAlign.BOTTOM :
			case StageAlign.BOTTOM_LEFT :
			case StageAlign.BOTTOM_RIGHT :
				y = y - _defaultHeight;
				break;
			case StageAlign.LEFT :
			case StageAlign.RIGHT :
			default :
				y = y - _defaultHeight * HALF;
				break;
		}
		return y;
	};

	/**
	* 引数で指定された位置の座標をPointオブジェクトで返します。
	* @method getAlignPoint
	* @param align {String} 座標を取得したいStage上の位置。StageAlignクラスの定数を使用することができます。
	* @return {Point} 座標を格納したPointオブジェクト。
	**/
	p.getAlignPoint = function(align) {
		var drawingAreaRect = _drawingAreaRect;
		var x = 0;
		var y = 0;
		switch (align) {
			case StageAlign.TOP :
				x = drawingAreaRect.width * HALF + drawingAreaRect.x;
				y = drawingAreaRect.y;
				break;
			case StageAlign.TOP_LEFT :
				x = drawingAreaRect.x;
				y = drawingAreaRect.y;
				break;
			case StageAlign.TOP_RIGHT :
				x = drawingAreaRect.width + drawingAreaRect.x;
				y = drawingAreaRect.y;
				break;
			case StageAlign.LEFT :
				x = drawingAreaRect.x;
				y = drawingAreaRect.height * HALF + drawingAreaRect.y;
				break;
			case StageAlign.RIGHT :
				x = drawingAreaRect.width + drawingAreaRect.x;
				y = drawingAreaRect.height * HALF + drawingAreaRect.y;
				break;
			case StageAlign.BOTTOM :
				x = drawingAreaRect.width * HALF + drawingAreaRect.x;
				y = drawingAreaRect.height + drawingAreaRect.y;
				break;
			case StageAlign.BOTTOM_LEFT :
				x = drawingAreaRect.x;
				y = drawingAreaRect.height + drawingAreaRect.y;
				break;
			case StageAlign.BOTTOM_RIGHT :
				x = drawingAreaRect.width + drawingAreaRect.x;
				y = drawingAreaRect.height + drawingAreaRect.y;
				break;
			default :
				x = drawingAreaRect.width * HALF + drawingAreaRect.x;
				y = drawingAreaRect.height * HALF + drawingAreaRect.y;
				break;
		}
		return new createjs.Point(x, y);
	};

	/**
	* LiquidLayouterに登録したobjectのレイアウトを更新します。
	* @method updateLayout
	* @param [object=undefined] {DisplayObject} レイアウトを更新したいobjectの参照。省略した場合は、LiquidLayouterに登録された全てのobjectのレイアウトが更新されます。
	**/
	p.updateLayout = function(object) {
		if (object) {
			var index = getIndexOfObject(_layoutObjects, object);
			if (index !== -1) {
				propertyConversion(_layoutObjects[index]);
			}
		} else {
			for (var i = 0, l = _layoutObjects.length; i < l; ++i) {
				propertyConversion(_layoutObjects[i]);
			}
		}
		_stage.update();
	};

	/**
	* ウィンドウサイズが変更された際に実行されるメソッドです。canvasのサイズ変更、drawingAreaRectの更新、登録されたDisplayObjectのレイアウトを更新する処理を行います。
	* @method onResize
	* @param [e=null] {Event} イベントオブジェクト。
	**/
	p.onResize = function(e) {
		updateCanvasSize();
		updateDrawingAreaRect();
		_instance.updateLayout();
	};

	/**
	* windowオブジェクトにresizeのイベントリスナーを追加します。initialize()の際に実行されているため、removeResizeListener()を実行した後でなければ、コールする意味はありません。
	* @method addResizeListener
	**/
	p.addResizeListener = function() {
		window.addEventListener("resize", this.onResize, false);
	};

	/**
	* windowオブジェクトからresizeのイベントリスナーを削除します。
	* @method removeResizeListener
	**/
	p.removeResizeListener = function() {
		window.removeEventListener("resize", this.onResize, false);
	};

	function updateDrawingAreaRect() {
		var canvasWidth = _canvas.width;
		var canvasHeight = _canvas.height;
		var minWidth = _instance.minWidth;
		var maxWidth = _instance.maxWidth;
		var minHeight = _instance.minHeight;
		var maxHeight = _instance.maxHeight;
		var width = canvasWidth;
		var height = canvasHeight;
		if (0 < minWidth && width < minWidth) {
			width = minWidth;
		} else if (0 < maxWidth && maxWidth < width) {
			width = maxWidth;
		}
		if (0 < minHeight && height < minHeight) {
			height = minHeight;
		} else if (0 < maxHeight && maxHeight < height) {
			height = maxHeight;
		}
		var marginX = width - canvasWidth;
		var marginY = height - canvasHeight;
		var x = 0;
		var y = 0;
		switch (_instance.align) {
			case StageAlign.TOP :
				x -= marginX * HALF;
				break;
			case StageAlign.TOP_LEFT :
				break;
			case StageAlign.TOP_RIGHT :
				x -= marginX;
				break;
			case StageAlign.LEFT :
				y -= marginY * HALF;
				break;
			case StageAlign.RIGHT :
				x -= marginX;
				y -= marginY * HALF;
				break;
			case StageAlign.BOTTOM :
				x -= marginX * HALF;
				y -= marginY;
				break;
			case StageAlign.BOTTOM_LEFT :
				y -= marginY;
				break;
			case StageAlign.BOTTOM_RIGHT :
				x -= marginX;
				y -= marginY;
				break;
			default :
				x -= marginX * HALF;
				y -= marginY * HALF;
				break;
		}
		_drawingAreaRect = new createjs.Rectangle(x, y, width, height);
	}

	function propertyConversion(layoutObject) {
		var align = layoutObject.align;
		var referencePoint = _instance.getAlignPoint(align);
		var drawingAreaRect = _drawingAreaRect;
		var x = 0;
		if (typeof layoutObject.x === "string") {
			x = drawingAreaRect.width * Number(layoutObject.x) + drawingAreaRect.x;
		} else {
			x = referencePoint.x + layoutObject.x;
		}
		var y = 0;
		if (typeof layoutObject.y === "string") {
			y = drawingAreaRect.height * Number(layoutObject.y) + drawingAreaRect.y;
		} else {
			y = referencePoint.y + layoutObject.y;
		}
		if (layoutObject.rounded) {
			switch (align) {
				case StageAlign.TOP :
					x = Math.round(x);
					y = Math.floor(y);
					break;
				case StageAlign.TOP_LEFT :
					x = Math.floor(x);
					y = Math.floor(y);
					break;
				case StageAlign.TOP_RIGHT :
					x = Math.ceil(x);
					y = Math.floor(y);
					break;
				case StageAlign.LEFT :
					x = Math.floor(x);
					y = Math.round(y);
					break;
				case StageAlign.RIGHT :
					x = Math.ceil(x);
					y = Math.round(y);
					break;
				case StageAlign.BOTTOM :
					x = Math.round(x);
					y = Math.ceil(y);
					break;
				case StageAlign.BOTTOM_LEFT :
					x = Math.floor(x);
					y = Math.ceil(y);
					break;
				case StageAlign.BOTTOM_RIGHT :
					x = Math.ceil(x);
					y = Math.ceil(y);
					break;
				default :
					x = Math.round(x);
					y = Math.round(y);
					break;
			}
		}
		var scaleX, scaleY;
		if (layoutObject.sizeFollowRule !== SizeFollowRule.NONE) {
			var canvasScaleX = drawingAreaRect.width / _defaultWidth;
			var canvasScaleY = drawingAreaRect.height / _defaultHeight;
			scaleX = layoutObject.scaleX;
			scaleY = layoutObject.scaleY;
			switch (layoutObject.sizeFollowRule) {
				case SizeFollowRule.WIDTH_FOLLOW :
					scaleX *= canvasScaleX;
					scaleY *= canvasScaleX;
					break;
				case SizeFollowRule.HEIGHT_FOLLOW :
					scaleX *= canvasScaleY;
					scaleY *= canvasScaleY;
					break;
				case SizeFollowRule.WIDTH_ONLY :
					scaleX *= canvasScaleX;
					scaleY = NaN;
					break;
				case SizeFollowRule.HEIGHT_ONLY :
					scaleX = NaN;
					scaleY *= canvasScaleY;
					break;
				case SizeFollowRule.FIT :
					scaleX *= canvasScaleX;
					scaleY *= canvasScaleY;
					break;
				case SizeFollowRule.AUTO :
				default :
					if (canvasScaleY <= canvasScaleX) {
						scaleX *= canvasScaleX;
						scaleY *= canvasScaleX;
					} else {
						scaleX *= canvasScaleY;
						scaleY *= canvasScaleY;
					}
					break;
			}
		}
		var object = layoutObject.object;
		if (_isOrientationDevice && _instance.tweenEnabled) {
			var properties = {x:x, y:y};
			if (!isNaN(scaleX)) {
				properties.scaleX = scaleX;
			}
			if (!isNaN(scaleY)) {
				properties.scaleY = scaleY;
			}
			createjs.Tween.get(object, {override:true}).to(properties, _instance.tweenTime, _instance.tweenEase);
		} else {
			object.x = x;
			object.y = y;
			if (!isNaN(scaleX)) {
				object.scaleX = scaleX;
			}
			if (!isNaN(scaleY)) {
				object.scaleY = scaleY;
			}
		}
	}

	function updateCanvasSize() {
		if (!_instance.fixedWidth) {
			_canvas.width = document.documentElement.clientWidth;
		}
		if (!_instance.fixedHeight) {
			_canvas.height = document.documentElement.clientHeight;
		}
	}

	function getIndexOfObject(array, object) {
		for (var i = 0, l = array.length; i < l; ++i) {
			var element = array[i];
			if (element.object === object) {
				return i;
			}
		}
		return -1;
	}

	/**
	* LiquidLayouterが内部でobjectを保持する際に使用するクラスです。このコンストラクタは、外部からコールすることはできません。LiquidLayouterにobjectを登録するには、addLayoutObject()を使用して下さい。
	* @private
	* @class LayoutObject
	* @constructor
	* @param object {DisplayObject} DisplayObjectの参照。
	* @param align {String} DisplayObjectを配置する位置。
	* @param x {Number | String} 数値の場合はalignの座標から見た相対x座標。文字列の場合はStageの幅を"1"とした比率。
	* @param y {Number | String} 数値の場合はalignの座標から見た相対y座標。文字列の場合はStageの高さを"1"とした比率。
	* @param rounded {Boolean} 座標値を整数に丸めるかのBool値。
	* @param sizeFollowRule {String} ステージサイズの変更に伴ってobjectのサイズを変更する際のルール。
	* @param scaleX {Number} object.scaleXの初期値。
	* @param scaleY {Number} object.scaleYの初期値。
	**/
	function LayoutObject(object, align, x, y, rounded, sizeFollowRule, scaleX, scaleY) {
		this.object = object;
		this.align = align;
		this.x = x;
		this.y = y;
		this.rounded = rounded;
		this.sizeFollowRule = sizeFollowRule;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
	}

	/**
	* StageAlignクラスは、Staticクラスであり、インスタンス化することはできません。StageAlignクラスは、alignプロパティに使用する定数値を提供します。
	* @static
	* @class StageAlign
	**/
	function StageAlign() {
		throw new Error("StageAlign is a static class and can not be instantiated.");
	}

	/**
	* 値は"B"です。縦位置は下揃え、横位置は中央揃えを指定します。
	* @static
	* @property BOTTOM
	* @type String
	* @final
	**/
	StageAlign.BOTTOM = "B";

	/**
	* 値は"BL"です。縦位置は下揃え、横位置は左揃えを指定します。
	* @static
	* @property BOTTOM_LEFT
	* @type String
	* @final
	**/
	StageAlign.BOTTOM_LEFT = "BL";

	/**
	* 値は"BR"です。縦位置は下揃え、横位置は右揃えを指定します。
	* @static
	* @property BOTTOM_RIGHT
	* @type String
	* @final
	**/
	StageAlign.BOTTOM_RIGHT = "BR";

	/**
	* 値は"L"です。縦位置は中央揃え、横位置は左揃えを指定します。
	* @static
	* @property LEFT
	* @type String
	* @final
	*/
	StageAlign.LEFT = "L";

	/**
	* 値は"R"です。縦位置は中央揃え、横位置は右揃えを指定します。
	* @static
	* @property RIGHT
	* @type String
	* @final
	**/
	StageAlign.RIGHT = "R";

	/**
	* 値は"T"です。縦位置は上揃え、横位置は中央揃えを指定します。
	* @static
	* @property TOP
	* @type String
	* @final
	**/
	StageAlign.TOP = "T";

	/**
	* 値は"TL"です。縦位置は上揃え、横位置は左揃えを指定します。
	* @static
	* @property TOP_LEFT
	* @type String
	* @final
	**/
	StageAlign.TOP_LEFT = "TL";

	/**
	* 値は"TR"です。縦位置は上揃え、横位置は右揃えを指定します。
	* @static
	* @property TOP_RIGHT
	* @type String
	* @final
	**/
	StageAlign.TOP_RIGHT = "TR";

	/**
	* SizeFollowRuleクラスは、Staticクラスであり、インスタンス化することはできません。SizeFollowRuleクラスは、sizeFollowRuleプロパティに使用する定数値を提供します。
	* @static
	* @class SizeFollowRule
	**/
	function SizeFollowRule() {
		throw new Error("SizeFollowRule is a static class and can not be instantiated.");
	}

	/**
	* 値は"auto"です。canvasの幅の拡大・縮小率とcanvasの高さの拡大・縮小率を比べて、大きい方の拡大・縮小率でobjectのscaleX, scaleYを変更します。objectのアスペクト比は維持します。
	* @static
	* @property AUTO
	* @type String
	* @final
	**/
	SizeFollowRule.AUTO = "auto";

	/**
	* 値は"widthFollow"です。canvasの幅の拡大・縮小率でobjectのscaleX, scaleYを変更します。objectのアスペクト比は維持します。
	* @static
	* @property WIDTH_FOLLOW
	* @type String
	* @final
	**/
	SizeFollowRule.WIDTH_FOLLOW = "widthFollow";

	/**
	* 値は"heightFollow"です。canvasの高さの拡大・縮小率でobjectのscaleX, scaleYを変更します。objectのアスペクト比は維持します。
	* @static
	* @property HEIGHT_FOLLOW
	* @type String
	* @final
	**/
	SizeFollowRule.HEIGHT_FOLLOW = "heightFollow";

	/**
	* 値は"widthOnly"です。canvasの幅の拡大・縮小率でobjectのscaleXを変更します。objectのアスペクト比は維持しません。
	* @static
	* @property WIDTH_ONLY
	* @type String
	* @final
	**/
	SizeFollowRule.WIDTH_ONLY = "widthOnly";

	/**
	* 値は"heightOnly"です。canvasの高さの拡大・縮小率でobjectのscaleYを変更します。objectのアスペクト比は維持しません。
	* @static
	* @property HEIGHT_ONLY
	* @type String
	* @final
	**/
	SizeFollowRule.HEIGHT_ONLY = "heightOnly";

	/**
	* 値は"fit"です。canvasの幅の拡大・縮小率でobjectのscaleXを変更し、canvasの高さの拡大・縮小率でobjectのscaleYを変更します。objectのアスペクト比は維持しません。
	* @static
	* @property FIT
	* @type String
	* @final
	**/
	SizeFollowRule.FIT = "fit";

	/**
	* 値は"none"です。サイズ変更処理を行いません。
	* @static
	* @property NONE
	* @type String
	* @final
	**/
	SizeFollowRule.NONE = "none";

	createjs.LiquidLayouter = LiquidLayouter;
	createjs.StageAlign = StageAlign;
	createjs.SizeFollowRule = SizeFollowRule;
}(window));
