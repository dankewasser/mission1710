/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _pixionly = __webpack_require__(2);
	
	var _pixionly2 = _interopRequireDefault(_pixionly);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	window.pixi_test = {
	  isDebug: true
	  // isDebug: false
	};
	
	$(function () {
	  "use strict";
	
	  var main = new _pixionly2.default();
	});

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * pixi.jsだけに割り切ってやったやつ
	 */
	
	/**
	 * Main
	 * 文字通り
	 */
	var Main = function () {
	  /**
	   * Main 初期化
	   */
	  function Main() {
	    _classCallCheck(this, Main);
	
	    this.main();
	  }
	
	  /**
	   * Main メイン
	   */
	
	
	  _createClass(Main, [{
	    key: 'main',
	    value: function main(e) {
	      "use strict";
	      //Math
	
	      var myRound = Math.round,
	          myCeil = Math.ceil,
	          myRandom = Math.random,
	          mySin = Math.sin,
	          myCos = Math.cos,
	          mySqrt = Math.sqrt,
	          myPI = Math.PI;
	      var myPow = function myPow(a, b) {
	        var c = a;
	        for (var i = 1; i < b; i++) {
	          c *= a;
	        }
	        return c;
	      };
	      var myPow2 = function myPow2(a) {
	        return a * a;
	      };
	      var myAbs = function myAbs(a) {
	        return a < 0 ? -a : a;
	      };
	      var myFloor = function myFloor(a) {
	        return a | 0;
	      };
	      var myHypot = function myHypot(a, b) {
	        return mySqrt(a * a + b * b);
	      };
	      var myTrace = function myTrace(ary) {
	        if (window.pixi_test.isDebug) {
	          console.log(ary);
	        }
	      };
	      var toRadian = function toRadian(a) {
	        return a * myPI / 180;
	      };
	      var getDecimalLength = function getDecimalLength(num) {
	        var splittedNum = (num + '').split('.'),
	            len = 0;
	        if (splittedNum[1]) {
	          len = splittedNum[1].length;
	        }
	        return len;
	      };
	
	      //Aliases
	      var Container = PIXI.Container,
	          autoDetectRenderer = PIXI.autoDetectRenderer,
	          CanvasRenderer = PIXI.CanvasRenderer,
	          loader = PIXI.loader,
	          resources = PIXI.loader.resources,
	          Sprite = PIXI.Sprite;
	
	      var STAGE_WIDTH = 640;
	      var STAGE_HEIGHT = 640;
	
	      var containers = [];
	      var MAX_CONTAINERS = 5;
	      var layerIDs = {
	        'bullet': [1, 0, 0],
	        'bg': [0, 0, 0],
	        'player': 2,
	        'spatk': 3,
	        'ui': 4
	      };
	      var isEnd = false;
	      var isKeyboard = false;
	
	      //Create a Pixi stage and renderer and add the
	      //renderer.view to the DOM
	      myTrace('stage append');
	      var stage = new Container(),
	          rendererP;
	      if (confirm('WebGLを使えたら使いましょうか')) {
	        rendererP = new autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, { antialias: true, transparent: false, backgroundColor: 0x001e43, resolution: 1 });
	      } else {
	        rendererP = new CanvasRenderer(STAGE_WIDTH, STAGE_HEIGHT, { antialias: true, transparent: false, backgroundColor: 0x001e43, resolution: 1 });
	      }
	      document.body.appendChild(rendererP.view).setAttribute('class', 'c-main');
	      stage.interactive = !isKeyboard;
	
	      var snow0b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAnxQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAA////J3MY0QAAANN0Uk5Tf8q6q9a706WThKkmFFJKRdG0xShDl76QeRqjv0kzZzhT9OLcMeStQsK2WbXOoMAkgZUndnxVhTxbc15fQOpG4KosPqTh6Ry8r5SbfgwyTxY3h9vMJStu32va8cFt+KJl1e4w3Yl9pmSzjsSyNJ2AmuU2QXc5bIYYvU2NPcjGjNeYR06oE+guOlbZuVBU68vm3thaIe3H+UxxmSJvFQ1yLz/J8xkdHyAe4w8jjxBLGy3y0qyugzUp92nvBQoO7PVgFwYJ9gsSCPwRB/v6A/0EAv4BAD6Ui6EAAAWlSURBVFjDtZf1W1p9FMBZd3dvrlz3XNjd3d3d3V0wxalDxUAkJKRFQGkEQRCc2z/0XouxS7w+z33f8wM/cT7P99zzvfd8DuwXODZ+ra8Z5CvCQBFFo+oEQqWhiAKFK3LD2vqG2b9/wczyt9KVIs1JGZ5BIBGJJAIDLzupESktI2Dm+UtAuiqEQaSe4EUxu7uZUbwTVCIjRAUglswJMHC+Qa6YUsm8xy8wg0J7GrCOjtiGntAg5oVxb5lqSiE3gAkwcP6qkDLJGOc9uIM9czr4VF9vb9+p4NNnsHce8MYZkxThKpgAA+craTLS2/TKx/S7Q9IUQWxiYqwgRTp0l/64Mv0tSUZTggkwcL6mZjiqrHy0VyoYq8h6zf34kfs6q2JMIO0dLS+LGq7RgAkwcD6e2t3T1ietqijOnHuD9i8q8ke/mcssrqiS9rX1dFPxYIIpYE0upNVQpxvoQ4J33LzWF9kc34Lc3AJfTvaL1jzuO8EQvWGaWkMTytcsAjbWlxQU2fh0Q/uXiYBmtMf8M5+X+U0oVFP+S59n8x7o5oCJL+0N0+MyimLJ5Ah/AEABU5NEN4c6KYZ7NHkekdD4nJ3aMjjYksp+3piAmE8+ysVI6xzciJNTQBHmAOAAQg2DV0n/+rm6teNJApI9mOFJLh0YKCV7ZgyykQlPOlqrP3+lV/IYGqHJEf4ADCsi2atC509j1SUH9qPYcS6lXuK0RSDSxF6lLnFs1P4DJdVjn5wLX8lEKwYzwOYBVCQm9kMVt5VTizwYM9C/yMJJloGQ4FiL/QMxB5G1nFZu1Qcsk6QyOYIRsLY6JYsMHc1573fcJwJu57WIW+aP6LZihL+MW/Syg0f4HPd7nzMaGimbWl0DA9YNCg2BWf4U0+yBQMIfiuMlSTqtWq3W64EfrS5JEi9+CEciPJoxT8uZBI3C+BhhuxXIlZPUhdGU4pKCphaymMUf0ar1P3dCr9aO8FlicktTQUlxyugCdVIp360BZqxAhOe592LqO26wXfpZfN1W+u+t2ELo+Kx+F/aNjnpMrzsPLzLWADP2QEOYdpZmoXNnwrvit/N/G2ObEN8VPpOLzpI6TxM0xj4YAcLO4YU6Qdj1WrZdmkSnNk3fRqh1kjQ7du31MEHdwnCnEARYX1KGRPb0jV3hnId3sZK0elA+QNBrk1hd8POcK2N9PZEhyqX1vwHywBoedujqpXMRMWKJzjx/k6CTiGMizl26OoTl1QTK/wIATRBdc7soDShCnCUv8rWWAVr+IvksoihAetHtmmi3DbDdJlAY3W053OTLqQOsEbWFfICgHmENpF5O5ua0dTMou20wAmiE9Ju3w7ITBrtwFivYqgHXNZiQHXb7ZjqBBgas0EhBdEFmR36c0z2d/rfF0OvuOcXld2QK6EEk2goYoCHeqottdm0K75dorQG0kv7wJtfm2LpbRA0IANyj2cL2xHoO6r5Yov1pGfBTKxHfR3HqE9sLZ403aRegUM0uBEfnPWrMEC9bByyLMxof5UUHL8yqFBYA36Ln5me+/7AF+PF9Zn4u+ps1wMTeABOWAcNleweUDf8fAMgl/AcPEVIboV4kyFcZ+ssE+XWG+kGB+kmD/FGF/lk3HSxk64OFbHWwmIy2fbZG2z6ro810uHpaG66eNoarcbz7F6CA8Y4zH+84YLyjCvytjHfIgmGqOK61EXCyE1hxnMjwiFpX64qzI1mOgGShAclqMZesFkCy0IBkOVqWrF3Na9vUPM6hRnPNazzE2dS8Niuaty2a3kbRtEceNhXNw0j7J8d3RNPbsmjuqC7ToV2KOeaX7IuwN1Vde4Rvst8xjLTdgWlNdY2y7b4p2/UlR/6W7SMl9TBAtt1tyPa27uP/TffxVnUf+sKxl5UHb2vlgb507WHtU9pe+6AvntBXX+jLN0DYsLH+m+///wC8Edu8RXAg+QAAAABJRU5ErkJggg==',
	          snow1b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAvpQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAA////5ZLKSQAAAP10Uk5Ttk6PzTmwYI64m21LkbTdo5CXzG6urVSLeHB1PKzHu5nnlHqYfHdde31Sck9AXsni18im5LPAP7+EOINhnqWdnGJWa2xT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',
	          snow2b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAvpQTFRF////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAA////5ZLKSQAAAP10Uk5TbpuyodelmkLAXrWLbI1fcMSXy0RmNtVH0ZSHuGvjtpKciafghqBoRc6Wdjt0eHxWQXNUU4RRyVexvYivwTORrUl1pINP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';
	
	      var textureSnow0, textureSnow1, textureSnow2;
	
	      var state;
	      var bullets = [];
	      var patterns = [];
	
	      var frameCnt = 0;
	
	      var clickCnt = 1;
	
	      var remainingTime = 0,
	          overallRemainingTime = 0,
	          overallEndFrame;
	
	      var blurFilter = new PIXI.filters.BlurFilter(),
	          blurFilter2 = new PIXI.filters.BlurFilter(),
	          bloomFilter = new PIXI.filters.BloomFilter();
	
	      var textObj = {};
	      var stats;
	
	      $('.c-main').on('click', function () {
	        if (clickCnt === 5 && !confirm('非力な端末ではもう処理落ちしてしまうと思われますが、増やしますか？')) {
	          return false;
	        } else if (clickCnt === 20 && !confirm('そろそろ過負荷なのではと思われますが、本当に増やしますか？ ブラウザが不安定になるかもしれません')) {
	          return false;
	        } else if (clickCnt < 50) {
	          clickCnt++;
	        }
	      });
	
	      function loadObjects() {
	        // function pixiLoaderCallBack() {
	        setup();
	        // }
	
	        // loader
	        //   .add('./images/snow0.png')
	        //   .add('./images/snow1.png')
	        //   .add('./images/snow2.png')
	        //   .load(pixiLoaderCallBack);
	      }
	
	      loadObjects();
	
	      function setup() {
	        myTrace('setup');
	
	        for (var i = 0; i < MAX_CONTAINERS; i++) {
	          containers[i] = new PIXI.DisplayObjectContainer();
	          containers[i].position.x = 0;
	          containers[i].position.y = 0;
	          stage.addChild(containers[i]);
	        }
	
	        // 雪のテクスチャだけここで
	        textureSnow0 = PIXI.Texture.fromImage(snow0b64);
	        textureSnow1 = PIXI.Texture.fromImage(snow1b64);
	        textureSnow2 = PIXI.Texture.fromImage(snow2b64);
	
	        // 開始フレーム, 長さ, パターン番号
	        patterns[0] = [0, 1200, 0];
	        patterns[1] = [1200, 300, 0.9];
	        for (var _i = 1; _i < 4; _i++) {
	          patterns.push([patterns[patterns.length - 1][0] + 60, 1200, _i]);
	          patterns.push([patterns[patterns.length - 1][0] + 1200, 60, _i + 0.9]);
	        }
	        for (var _i2 = 4; _i2 < 6; _i2++) {
	          patterns.push([patterns[patterns.length - 1][0] + 60, 1800, _i2]);
	          patterns.push([patterns[patterns.length - 1][0] + 1800, 60, _i2 + 0.9]);
	        }
	        patterns.push([patterns[patterns.length - 1][0] + 60, 3600, 6]);
	        patterns.push([patterns[patterns.length - 1][0] + 3600, 60, 6 + 0.9]);
	
	        overallEndFrame = patterns[patterns.length - 1][0];
	
	        // Add UI
	        textObj.scoreNum = new PIXI.Text('0', { font: 'bold 20px Arial', fill: '#ffffff', align: 'right' });
	        textObj.scoreNum.position.x = 144;
	        textObj.scoreNum.position.y = 10;
	        textObj.scoreNum.anchor.x = 1;
	
	        textObj.scoreRatio = new PIXI.Text('0', { font: 'bold 20px Arial', fill: '#ffffff', align: 'right' });
	        textObj.scoreRatio.position.x = 144;
	        textObj.scoreRatio.position.y = 36;
	        textObj.scoreRatio.anchor.x = 1;
	
	        Object.keys(textObj).forEach(function (key) {
	          containers[layerIDs.ui].addChild(textObj[key]);
	        });
	
	        //Set the game state
	        state = playState;
	
	        // filters
	        blurFilter.blur = 1;
	        blurFilter2.blur = 2;
	        bloomFilter.blur = 2;
	
	        // add stats
	        stats = new Stats();
	        stats.domElement.style.position = 'absolute';
	        stats.domElement.style.top = '0px';
	        stats.domElement.style.left = '640px';
	        stats.domElement.style.zIndex = 10;
	        document.body.appendChild(stats.domElement);
	
	        // call background animation
	        // callBG();
	
	
	        //Start the game loop
	        gameLoop();
	      }
	
	      function gameLoop() {
	        // myTrace('loop');
	        if (!isEnd) {
	          requestAnimationFrame(gameLoop);
	
	          //Update the current game state
	          state();
	
	          //Render the stage
	          rendererP.render(stage);
	        }
	      }
	
	      function playState() {
	        //bulletの生成
	        callAddBullet();
	
	        //bulletの移動
	        moveBullets();
	
	        //はみ出たbulletをまとめて消去
	        // removeBullets();
	        filterBullets();
	
	        // テキスト更新
	        refreshText();
	
	        // fps表示更新
	        stats.update();
	        // if (stats.getFps() < 10) {
	        //   busyCnt++;
	        //   if (busyCnt > 60) {
	        //     isEnd = true;
	        //     alert('フレームレートがひどく落ち込んでいるので停止します');
	        //   }
	        // } else {
	        //   busyCnt = 0;
	        // }
	
	        // 現フレーム数をインクリメント
	        frameCnt++;
	      }
	
	      function refreshText() {
	        textObj.scoreNum.setText(bullets.length);
	        textObj.scoreRatio.setText('x' + clickCnt);
	      }
	
	      function callAddBullet() {
	        var currentPtn = patterns[0];
	        var currentOffsettedFrame = frameCnt - currentPtn[0];
	        var offsettedEndFrame = currentPtn[1];
	
	        // if (getDecimalLength(currentPtn[2]) === 0) {
	        //   remainingTime = myCeil((offsettedEndFrame - currentOffsettedFrame) / 60);
	        // } else {
	        //   remainingTime = '';
	        // }
	        // overallRemainingTime = myCeil((overallEndFrame - frameCnt) / 60);
	
	
	        if (frameCnt % 6 === 0) {
	          for (var i = 0; i < clickCnt; i++) {
	            addBullet(0);
	          }
	        }
	        if (frameCnt % 3 === 0) {
	          for (var _i3 = 0; _i3 < clickCnt; _i3++) {
	            addBullet(1);
	          }
	        }
	        // if (frameCnt % 1 === 0) {
	        for (var _i4 = 0; _i4 < clickCnt; _i4++) {
	          addBullet(2);
	        }
	        // }
	      }
	
	      function addBullet(ptn) {
	        // myTrace('addBullet');
	        var bullet;
	
	        var ratio;
	        switch (ptn) {
	          case 1:
	            ratio = (myFloor(Math.random() * 21) + 45) * 0.01;
	            break;
	          case 2:
	            ratio = (myFloor(Math.random() * 21) + 20) * 0.01;
	            break;
	          default:
	            ratio = (myFloor(Math.random() * 21) + 70) * 0.01;
	        }
	
	        var imgID = myFloor(Math.random() * 3);
	        switch (imgID) {
	          case 1:
	            bullet = new Sprite(textureSnow1);
	            break;
	          case 2:
	            bullet = new Sprite(textureSnow2);
	            break;
	          default:
	            bullet = new Sprite(textureSnow0);
	        }
	
	        bullet.layer = 0;
	        bullet.width = 16 * ratio;
	        bullet.height = 16 * ratio;
	        bullet.alpha = ratio;
	        // bullet.hitRadius = 4;
	        bullet.defX = myFloor(Math.random() * (STAGE_WIDTH + 230) - 115);
	        bullet.defY = -64;
	        bullet.x = bullet.defX;
	        bullet.y = bullet.defY;
	        bullet.anchor.x = 0.5;
	        bullet.anchor.y = 0.5;
	        bullet.lastX = bullet.defX; // 前フレームの座標
	        bullet.lastY = bullet.defY; // 同上
	        bullet.eraseX = 64; //この数値だけステージからはみ出たら消える
	        bullet.eraseY = 64; //同上
	        bullet.rotation = myFloor(Math.random() * 31) - 60;
	        // bullet.vec = [[0, 1], [0, 0]];// かかっているベクトルを二次元配列で
	        bullet.nVec = [0, 1]; // 上のを正規化後
	        bullet.spd = 4 * ratio; // 移動速度 ベクトルの大きさ
	        bullet.ptn = ptn;
	        // bullet.createdFrame = frameCnt;
	        // bullet.offsettedFrame = offsettedFrame;
	        bullet.erase = false;
	        bullet.blendMode = PIXI.BLEND_MODES.ADD;
	        containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
	        bullets[bullets.length] = bullet;
	      }
	
	      function moveBullets() {
	        for (var i = 0, j = bullets.length; i < j; i++) {
	          var bullet = bullets[i];
	          // この時点での座標を格納
	          bullet.lastX = bullet.x;
	          bullet.lastY = bullet.y;
	
	          // bullet.x = bullet.lastX + bullet.nVec[0] * bullet.spd;
	          // bullet.y = bullet.lastY + bullet.nVec[1] * bullet.spd;
	          bullet.y = bullet.lastY + bullet.spd;
	
	          if (bullet.x < -bullet.eraseX || bullet.x > STAGE_WIDTH + bullet.eraseX || bullet.y < -bullet.eraseY || bullet.y > STAGE_HEIGHT + bullet.eraseY) {
	            bullet.erase = true;
	            containers[layerIDs.bullet[bullet.layer]].removeChild(bullet);
	          }
	        }
	      }
	
	      function removeBullets() {
	        for (var i = bullets.length - 1, j = 0; i >= j; i--) {
	          if (bullets[i].erase === true) {
	            containers[layerIDs.bullet[bullets[i].layer]].removeChild(bullets[i]);
	            bullets.splice(i, 1);
	          }
	        }
	      }
	
	      function filterBullets() {
	        // bullets = bullets.filter(function(val) {
	        //   return val.erase === false;
	        // });
	
	        // var tmpBullets = [];
	        // for (var i = 0, j = bullets.length; i < j; i++) {
	        //   if (bullets[i].erase !== true) {
	        //     tmpBullets.push(bullets[i]);
	        //   }
	        // }
	        // bullets = tmpBullets;
	
	        var len = bullets.length;
	
	        var tmpBullets = new Array(len);
	        var idx = 0;
	        for (var i = 0; i < len; i++) {
	          if (bullets[i].erase !== true) {
	            tmpBullets[idx] = bullets[i];
	            idx++;
	          }
	        }
	
	        if (len > idx) tmpBullets.splice(idx);
	        bullets = tmpBullets;
	      }
	    }
	  }]);
	
	  return Main;
	}();
	
	exports.default = Main;

/***/ })
/******/ ]);
//# sourceMappingURL=cmn.js.map