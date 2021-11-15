/*
02 : 12_keyboardMovement.htmlのほぼ丸パクリ 四角を描きたかっただけ
03 : 四角をまともに動かせるように（斜め入力を有効に・シフトでスローを可能に）
04 : 雪を生成して降らしてみる
05 : こいつはいい！ まだまだ出せるぞ！ 640x480 のサイズで秒間60玉生成でおおむね60fpsキープ（GCか何かの引っかかりさえなければ）
     秒間600玉でもちょっとひっかかるけどいけちゃう
06 : 当たり判定を半径だけ使って簡易的に追加 すり抜けが起こり得るんじゃないかなあ
07 : スペースキーで出現する傘オブジェクトを追加 各スプライトの原点を中心にずらした ここから素材はバージョンごとのフォルダに分ける体裁にする
08 : せっかくなので自機狙いパターンを追加 雪じゃないねこれ
09 : JSを外に出す
10 : 何回か当たったら止めたり某ラスボス弾幕パターン追加したり計算を最適化したり
11 : 2倍と0.5倍はビットシフトにする ほか気持ちばかりリファクタリング
12 : パターン追加、letとかforEachとかパフォーマンス悪い書き方をやめてどんどん古風になってゆく 肥大化してきた
13 : パターン追加、弾の消える範囲をもっと広めにとる
14 : パターン追加するか、背景付けるか、弾の消えるエフェクトを作るかそのへん
*/

/**
 * Main
 * 文字通り
 */
export default class Main {
  /**
   * Main 初期化
   */
  constructor() {
    this.main();
  }

  /**
   * Main メイン
   */
  main(e) {
    "use strict";
    //Math
    var myRound = Math.round,
        myCeil = Math.ceil,
        myRandom = Math.random,
        mySin = Math.sin,
        myCos = Math.cos,
        mySqrt = Math.sqrt,
        myPI = Math.PI;
    var myPow = function(a, b) {
      var c = a;
      for (var i = 1; i < b; i++) {
        c *= a;
      }
      return c;
    };
    var myPow2 = function(a) {
      return a * a;
    };
    var myAbs = function(a) {
      return a < 0 ? -a : a;
    };
    var myFloor = function(a) {
      return a | 0;
    };
    var myHypot = function(a, b) {
      return mySqrt(a * a + b * b);
    };
    var myTrace = function(ary) {
      if (window.pixi_test.isDebug) {
        console.log(ary);
      }
    };
    var toRadian = function(a) {
      return a * myPI / 180;
    };
    var getDecimalLength = function(num) {
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
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite;

    const STAGE_WIDTH = 640;
    const STAGE_HEIGHT = 640;

    var containers = [];
    const MAX_CONTAINERS = 5;
    var layerIDs = {
      'bullet': [1, 0, 0],
      'bg': [0, 0, 0],
      'player': 2,
      'spatk': 3,
      'ui': 4
    };
    var isEnd = false;
    var difficulty = 'normal';
    var isKeyboard = confirm('キーボードで操作します？');
    var fogColor = (difficulty === 'normal') ? 0x001e43 : 0x6c2735;

    //Create a Pixi stage and renderer and add the
    //renderer.view to the DOM
    myTrace('stage append');
    var stage = new Container(),
        rendererP = autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, {antialias: true, transparent:true, resolution: 1});
    document.body.appendChild(rendererP.view).setAttribute('class', 'c-main');
    stage.interactive = !isKeyboard;

    //Define any variables that are used in more than one function
    // var texturesPlayer = [],
    //     texturesSnow4 = [];

    // var texturePlayer = PIXI.Texture.fromFrame('./img/playerImg.png');
    // texturesPlayer.push(texturesPlayer);
    // var textureSnow4 = PIXI.Texture.fromFrame('./img/snow4x4Img.png');
    // texturesSnow4x4.push(texturesSnow4x4);
    var texturePlayer,
        textureSpAtk,
        textureSnow4,
        textureSnow8,
        textureSnow16,
        textureSnow24,
        textureSnow32,
        textureSnow40,
        textureSnow48,
        textureSnow56,
        textureSnow64,
        textureBit,
        textureBitDisabled;
    // var player = new PIXI.extras.MovieClip(texturesPlayer);
    // var snow4x4 = new PIXI.extras.MovieClip(texturesSnow4x4);
    var player,
        // lights = [],
        // lightMotion,
        spatk,
        spatkArc;

    var state;
    var bullets = [];
    var patterns = [];
    var prevPattern = 0;
    var bits = [];
    var currentBitRadius = 80;

    var frameCnt = 0;
    var buzzCnt = 0;

    var scoreRatio = 1,//倍率
        prevScoreRatio = null,//1フレーム前の倍率（更新するかどうかの確認用）
        rawScore = 1,//素点
        totalScore = 0,//合計
        // prevTotalScore = null,
        remainingTime = 0,//今のパターンの残り時間
        prevRemainingTime = null,
        overallRemainingTime = 0,//今のパターンの残り時間
        prevOverallRemainingTime = null,
        overallEndFrame;

    var blurFilter = new PIXI.filters.BlurFilter(),
        blurFilter2 = new PIXI.filters.BlurFilter(),
        bloomFilter = new PIXI.filters.BloomFilter();
        // shockwaveFilter = new PIXI.filters.ShockwaveFilter(),
        // pixelateFilter = new PIXI.filters.PixelateFilter();

    var textObj = {};

    var threeObj = {};

    var stats;

    function loadObjects() {
      var loadedCnt = 0,
          maxObj = 3;

      function pixiLoaderCallBack() {
        loadedCnt++;
        callSetup();
      }

      loader
        .add('./img/playerimg.png')
        .add('./img/umbrellaimg.png')
        .add('./img/snowimg4.png')
        .add('./img/snowimg8.png')
        .add('./img/snowimg16.png')
        .add('./img/snowimg24.png')
        .add('./img/snowimg32.png')
        .add('./img/snowimg40.png')
        .add('./img/snowimg48.png')
        .add('./img/snowimg56.png')
        .add('./img/snowimg64.png')
        // .add('./img/bg1.png')
        .add('./img/bg2.png')
        .add('./img/bit.png')
        .add('./img/bitd.png')
        .load(pixiLoaderCallBack);


      function threeLoader(name) {
        console.log(name);
        var mtlName = name + '.mtl',
            objName = name + '.obj',
            mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( 'obj/' );
        mtlLoader.load( mtlName, function( materials ) {
          materials.preload();
          var objLoader = new THREE.OBJLoader();
          objLoader.setMaterials( materials );
          objLoader.setPath( 'obj/' );
          objLoader.load( objName, function ( object ) {
            object.traverse( function ( child ) {
              if ( child instanceof THREE.Mesh ) {
                child.castShadow = true;
                // child.receiveShadow = true;
              }
            });
            threeObj[name] = object;
            loadedCnt++;
            callSetup();
          });
        });
      }

      function callSetup() {
        if (loadedCnt >= maxObj) {
          setup();
        }
      }

      threeLoader('dead_trees_0');
      threeLoader('dead_trees_1');
    }

    loadObjects();



    function setup() {
      myTrace('setup');

      for (let i = 0; i < MAX_CONTAINERS; i++) {
        containers[i] = new PIXI.DisplayObjectContainer();
        containers[i].position.x = 0;
        containers[i].position.y = 0;
        stage.addChild(containers[i]);
      }

      // for (var n = 0; n < 2; n++) {
      //   texturePlayer = PIXI.Texture.fromFrame('./img/playerimg'+n+'.png');
      //   texturesPlayer.push(texturesPlayer);
      //   textureSnow4 = PIXI.Texture.fromFrame('./img/snow4x4img.png');
      //   texturesSnow4x4.push(texturesSnow4x4);
      // }

      // Create the `player` sprite
      // player = new Sprite();
      // player.beginFill(0xFFFF00);
      // player.lineStyle(5, 0xFF0000);
      // player.drawRect(0, 0, 4, 4);
      // player = new PIXI.extras.MovieClip(texturesPlayer);

      /* アニメーションさせなくてもいい場合 */
      texturePlayer = PIXI.Texture.fromFrame('./img/playerimg.png');
      player = new Sprite(texturePlayer);
      /* /アニメーションさせなくてもいい場合 */

      player.width = 4;
      player.height = 4;
      player.defX = (STAGE_WIDTH + player.width) >> 1;
      player.defY = STAGE_HEIGHT - 80;
      player.x = player.defX;// 現在のフレームでの座標
      player.y = player.defY;
      player.anchor.x = 0.5;
      player.anchor.y = 0.5;
      player.lastX = player.defX;// ひとつ前のフレームでの座標
      player.lastY = player.defY;
      player.vx = 0;
      player.vy = 0;
      player.spd = 4;
      player.spdSlow = 2;
      player.keyLeft = false;
      player.keyRight = false;
      player.keyUp = false;
      player.keyDown = false;
      player.keySlow = false;
      player.keySlowPrev = player.keySlow;
      player.keySp = false;
      player.mouseX = 0;
      player.mouseY = 0;
      // player.hitWidth = 2;
      // player.hitHeight = 2;
      player.hitRadius = 1;
      player.buzzRadius = 16;
      player.isHit = false;// このフレームで当たったかどうか
      player.life = 3;
      player.prevLife = null;
      player.isInvincible = false;// 無敵中かどうか
      player.hittedFrame = -6000;
      containers[layerIDs.player].addChild(player);
      // player.play();


      // 傘の初期化はここで バックグラウンドで傘の体力を回復させたりするので
      textureSpAtk = PIXI.Texture.fromFrame('./img/umbrellaimg.png');
      spatk = new Sprite(textureSpAtk);
      spatk.x = 0;// 現在のフレームでの座標
      spatk.y = 0;
      spatk.anchor.x = 0.5;
      spatk.anchor.y = 0.5;
      // spatk.lastX = spatk.x;// ひとつ前のフレームでの座標
      // spatk.lastY = spatk.y;
      spatk.vx = 0;
      spatk.vy = 0;
      // spatk.spd = 6;
      spatk.width = 160;
      spatk.height = 160;
      spatk.hitRadius = 80;
      // spatk.isHit = false;// このフレームで当たったかどうか
      spatk.changedFrame = -100;// 最後に出したり引っ込んだりしたフレーム 1秒以内は出し入れできないとかの判定に使う 出すのはしまってから1秒後、しまうのは出してから0.2秒くらい？
      // spatk.createdFrame = frameCnt;
      spatk.life = 10000;
      spatk.isUsed = false;// 表示されてるかどうか
      spatk.usable = true;// 使えるかどうか
      // spatk.prevUsable = true;


      // 雪のテクスチャだけここで
      textureSnow4 = PIXI.Texture.fromFrame('./img/snowimg4.png');
      textureSnow8 = PIXI.Texture.fromFrame('./img/snowimg8.png');
      textureSnow16 = PIXI.Texture.fromFrame('./img/snowimg16.png');
      textureSnow24 = PIXI.Texture.fromFrame('./img/snowimg24.png');
      textureSnow32 = PIXI.Texture.fromFrame('./img/snowimg32.png');
      textureSnow40 = PIXI.Texture.fromFrame('./img/snowimg40.png');
      textureSnow48 = PIXI.Texture.fromFrame('./img/snowimg48.png');
      textureSnow56 = PIXI.Texture.fromFrame('./img/snowimg56.png');
      textureSnow64 = PIXI.Texture.fromFrame('./img/snowimg64.png');


      // 苦肉の策
      textureBit = PIXI.Texture.fromFrame('./img/bit.png');
      textureBitDisabled = PIXI.Texture.fromFrame('./img/bitd.png');


      // 開始フレーム, 長さ, パターン番号
      patterns[0] = [0, 1200, 0];
      patterns[1] = [1200, 300, 0.9];
      for (let i = 1; i < 3; i++) {
        patterns.push([patterns[patterns.length - 1][0] + 60, 1200, i]);
        patterns.push([patterns[patterns.length - 1][0] + 1200, 60, i + 0.9]);
      }
      patterns.push([patterns[patterns.length - 1][0] + 60, 1200, 3]);
      patterns.push([patterns[patterns.length - 1][0] + 1200, 60, 3 + 0.9]);
      patterns.push([patterns[patterns.length - 1][0] + 60, 1800, 4]);
      patterns.push([patterns[patterns.length - 1][0] + 1800, 60, 4 + 0.9]);
      patterns.push([patterns[patterns.length - 1][0] + 60, 2400, 5]);
      patterns.push([patterns[patterns.length - 1][0] + 2400, 60, 5 + 0.9]);
      patterns.push([patterns[patterns.length - 1][0] + 60, 3600, 6]);
      patterns.push([patterns[patterns.length - 1][0] + 3600, 60, 6 + 0.9]);
      overallEndFrame = patterns[patterns.length - 1][0];


      //Capture the keyboard
      var keys = {
        // 'left': keyboard(37),
        // 'up': keyboard(38),
        // 'right': keyboard(39),
        // 'down': keyboard(40),
        'left': keyboard(65),// A
        'up': keyboard(87),// W
        'right': keyboard(68),// D
        'down': keyboard(83),// S
        'slow': keyboard(16),//Shift
        'sp': keyboard(32)//Space
      };

      //Left key `press` method
      keys.left.press = function() {
        player.keyLeft = true;
      };
      //Left key `release` method
      keys.left.release = function() {
        player.keyLeft = false;
      };

      //Up
      keys.up.press = function() {
        player.keyUp = true;
      };
      keys.up.release = function() {
        player.keyUp = false;
      };

      //Right
      keys.right.press = function() {
        player.keyRight = true;
      };
      keys.right.release = function() {
        player.keyRight = false;
      };

      //Down
      keys.down.press = function() {
        player.keyDown = true;
      };
      keys.down.release = function() {
        player.keyDown = false;
      };

      //Slow
      keys.slow.press = function() {
        player.keySlow = true;
      };
      keys.slow.release = function() {
        player.keySlow = false;
      };

      //Special
      keys.sp.press = function() {
        player.keySp = true;
      };
      keys.sp.release = function() {
        player.keySp = false;
      };

      if (!isKeyboard) {
        stage.mousemove = function(mouseData) {
          player.mouseX = rendererP.plugins.interaction.mouse.global.x;
          player.mouseY =  rendererP.plugins.interaction.mouse.global.y;
        };
      }


      // Add UI
      textObj.scoreTtl = new PIXI.Text('', {font:'bold 20px Arial', fill:'#ffffff'});
      textObj.scoreTtl.position.x = 10;
      textObj.scoreTtl.position.y = 10;

      textObj.scoreNum = new PIXI.Text('0', {font:'bold 20px Arial', fill:'#ffffff', align:'right'});
      textObj.scoreNum.position.x = 144;
      textObj.scoreNum.position.y = 10;
      textObj.scoreNum.anchor.x = 1;

      textObj.buzzTtl = new PIXI.Text('', {font:'bold 20px Arial', fill:'#ffffff'});
      textObj.buzzTtl.position.x = 10;
      textObj.buzzTtl.position.y = 30;

      textObj.buzzNum = new PIXI.Text('0', {font:'bold 28px Arial', fill:'#ffffff'});
      textObj.buzzNum.position.x = 10;
      textObj.buzzNum.position.y = 30;

      textObj.life = new PIXI.Text('', {font:'bold 20px Arial', fill:'#ffffff'});
      textObj.life.position.x = 10;
      textObj.life.position.y = 64;

      textObj.remainingTimeTtl = new PIXI.Text('残り時間', {font:'bold 16px Arial', fill:'#ffffff'});
      textObj.remainingTimeTtl.position.x = 10;
      textObj.remainingTimeTtl.position.y = STAGE_HEIGHT - 30;

      textObj.remainingTimeNum = new PIXI.Text('0', {font:'bold 16px Arial', fill:'#ffffff', align:'right'});
      textObj.remainingTimeNum.position.x = 90;
      textObj.remainingTimeNum.position.y = STAGE_HEIGHT - 30;

      textObj.overallRemainingTime = new PIXI.Text('0', {font:'bold 16px Arial', fill:'#ffffff'});
      textObj.overallRemainingTime.position.x = 112;
      textObj.overallRemainingTime.position.y = STAGE_HEIGHT - 30;

      Object.keys(textObj).forEach(function (key) {
        containers[layerIDs.ui].addChild(textObj[key]);
      });


      //Set the game state
      state = playState;


      // filters
      blurFilter.blur = 1;
      blurFilter2.blur = 2;
      bloomFilter.blur = 2;
      // フィルタとブレンドモードを同時に使えない？
      // containers[layerIDs.bullet[0]].filters = [blurFilter];
      containers[layerIDs.bg[1]].filters = [blurFilter2];
      containers[layerIDs.spatk].filters = [blurFilter];


      // デバッグ用
      if (window.pixi_test.isDebug) {
        player.life = 65535;
        // let ptn = 0;
        let ptn = 11;
        for (let i = 0; i < ptn; i++) {
          patterns.shift();
        }
        frameCnt = patterns[0][0];
      }


      // add stats
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      stats.domElement.style.left = '640px';
      stats.domElement.style.zIndex = 10;
      document.body.appendChild(stats.domElement);


      // call background animation
      callBG();


      //Start the game loop
      gameLoop();
    }


    function gameLoop(){
      // myTrace('loop');
      //Loop this function 60 times per second
      if (player.life > 0 && !isEnd) {
        requestAnimationFrame(gameLoop);
      } else if (player.life === 0) {
        alert(myFloor(frameCnt / 60) + '秒耐えられまして\n' + myFloor(totalScore) + '0点です');
        // myTrace([myFloor(frameCnt / 60), '秒耐えた']);
      } else {
        alert('おめでとうございます、こんな最後まで恐縮です\n' + myFloor(totalScore) + '0点です');
      }

      //Update the current game state
      state();

      //Render the stage
      rendererP.render(stage);
    }

    function getPtn() {
      var ptn;
      if (patterns.length > 1 && patterns[1][0] <= frameCnt) {
        patterns.shift();
      }
      ptn = patterns[0];
      return ptn;
    }


    function playState() {
      // playerの移動
      movePlayer();

      //bulletの生成
      callAddBullet();

      //bulletの移動
      moveBullets();

      //苦肉の策
      moveBits();

      //傘の開閉ができるかチェック
      setSpAtkUsable();

      //傘を出したりしまったりする処理 早めにやっておく1フレームの優しさ
      if (player.keySp === true) {
        changeSpAtk();
      }

      //傘の被弾判定 優先度高めで
      spHitCheck();

      //傘の被弾を踏まえて残り耐久力を描画
      drawSpAtk();

      //かすり判定 被弾判定はそこから呼ぶ
      buzzCheck();

      //被弾してたときの処理
      onHit();

      //はみ出たbulletをまとめて消去 逆回しで消さないとループ時にズレるので
      removeBullets();

      //スコアを増やす（いまのところ時間経過で増やしているだけなのでここで）
      addScore();

      // テキスト情報更新
      refreshText();

      // fps表示更新
      stats.update();

      // 現フレーム数をインクリメント
      frameCnt++;
    }


    function callAddBullet() {
      var currentPtn = getPtn();
      var currentOffsettedFrame = frameCnt - currentPtn[0];
      var offsettedEndFrame = currentPtn[1];

      if (getDecimalLength(currentPtn[2]) === 0) {
        remainingTime = myCeil((offsettedEndFrame - currentOffsettedFrame) / 60);
      } else {
        remainingTime = '';
      }
      overallRemainingTime = myCeil((overallEndFrame - frameCnt) / 60);


      switch (currentPtn[2]) {
        case 0:
          // 上からばら撒き 風なし
          if (frameCnt % 5 === 0) {
            // addBullet(2, 0, []);
            addBullet(3, currentOffsettedFrame, [60]);
          }
          break;
        // case 1:
        //   // ただの上から自機狙い イージー
        //   if (frameCnt % 12 === 1) {
        //     addBullet(10, currentOffsettedFrame, []);
        //   }
        //   break;
        case 1:
          // 上からばら撒き 風あり
          if (frameCnt % 6 === 0) {
            addBullet(0, currentOffsettedFrame, []);
            addBullet(1, currentOffsettedFrame, []);
          }
          break;
        case 2:
          // ただの上から自機狙い ノーマル
          if (frameCnt % 4 === 1) {
            addBullet(10, currentOffsettedFrame, []);
          }
          break;
        case 3:
          // 放射状にばら撒かれて戻っていく
          if (frameCnt % 2 === 0 && frameCnt % 85 > 55) {
            addBullet(50, currentOffsettedFrame, [60, [0, 100], (frameCnt % 1440) / 4]);
          }
          break;
        case 4:
          // 周囲を回転して拘束してくる
          // if (frameCnt) {
            // addBullet(40, currentOffsettedFrame, [[0, 300], [150, 0], 1, 0, false]);
            // // addBullet(40, currentOffsettedFrame, [[0, 300], [150, 0], 1, 180, false]);
            // addBullet(40, currentOffsettedFrame, [[0, 300], [150, 0], 1, 120, false]);
            // addBullet(40, currentOffsettedFrame, [[0, 300], [150, 0], 1, 240, false]);
            // // addBullet(40, currentOffsettedFrame, [[0, 300], [-150, 0], 1, 0, true]);
            // // addBullet(40, currentOffsettedFrame, [[0, 300], [-150, 0], 1, 180, true]);

            addBullet(43, currentOffsettedFrame, [[0, 260], [150, 0], 0.5, 0, false]);
            addBullet(43, currentOffsettedFrame, [[0, 260], [150, 0], 0.5, 120, false]);
            addBullet(43, currentOffsettedFrame, [[0, 260], [150, 0], 0.5, 240, false]);
          // }
          // if (frameCnt % 6 === 0) {
          //   addBullet(41, currentOffsettedFrame, [[0, 300], 300, 40, 0, false]);
          //   addBullet(41, currentOffsettedFrame, [[0, 300], 300, 40, 90, false]);
          // }
          if (frameCnt % 20 === 0 && currentOffsettedFrame > 360) {
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 0, 1, false]);
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 180, -1, false]);
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 0, -1, false]);
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 180, 1, false]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 0, 1, false]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 0, -1, false]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 120, 1, false]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 120, -1, false]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 240, 1, false]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 240, -1, false]);
          } else if (frameCnt % 20 === 10 && currentOffsettedFrame > 360) {
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 0, 1, true]);
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 180, -1, true]);
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 0, -1, true]);
            // addBullet(42, currentOffsettedFrame, [[0, 300], 150, 1, 180, 1, true]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 0, 1, true]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 0, -1, true]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 120, 1, true]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 120, -1, true]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 240, 1, true]);
            addBullet(42, currentOffsettedFrame, [[0, 260], 150, 1, 240, -1, true]);
          }
          break;
        case 5:
          // 某STGラストのアレを縦にした自称オマージュ
          if (frameCnt % 24 === 1) {
            addBullet(60, currentOffsettedFrame, [90, 150, 196, false, -4]);
            addBullet(60, currentOffsettedFrame, [270, 150, 198, true, STAGE_HEIGHT + 4]);
          }
          if (frameCnt % 300 > 60 && frameCnt % 8 === 1) {
            addBullet(31, currentOffsettedFrame, []);
            // addBullet(32, currentOffsettedFrame, []);
          }
          break;
        case 6:
          // 裏パーフェクトサマーアイスっぽい…何かだよ
          let randomDegree,
              myDegree = (currentOffsettedFrame % 2880) * 0.125 + 270,
              myRadian = toRadian(myDegree),
              // myDefX = 120 * myCos(myRadian) + (STAGE_WIDTH >> 1),
              myDefX = STAGE_WIDTH >> 1,
              myDefY = 60 * mySin(myRadian) + 120;
          if (frameCnt % 10 === 1) {
            for (let i = 0; i < 6; i++) {
              addBullet(70, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: i * 60, isReverse: false});
              addBullet(70, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: i * 60, isReverse: true});
            }
          }
          if (currentOffsettedFrame > 900 && frameCnt % 10 === 1) {
            randomDegree = myFloor(myRandom() * 360);
            for (let i = 0; i < 8; i++) {
              addBullet(71, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: randomDegree + 45 * i});
            }
          }
          if (currentOffsettedFrame > 1800 && frameCnt % 15 === 0 && frameCnt % 150 > 80) {
            var synVecX = player.x - myDefX;
            var synVecY = player.y - myDefY;
            var len = myHypot(synVecX, synVecY);
            var degree = 90;
            if (len !== 0) {
              degree = Math.atan2(synVecY, synVecX) * ( 180 / myPI );
            }
            addBullet(72, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: degree - 16});
            addBullet(72, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: degree - 8});
            addBullet(72, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: degree});
            addBullet(72, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: degree + 8});
            addBullet(72, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: degree + 16});

            // randomDegree = myFloor(myRandom() * 360);
            //
            // for (let i = 0; i < 72; i++) {
            //   addBullet(72, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: randomDegree + 5 * i});
            // }
          }
          if (currentOffsettedFrame > 2700) {
            // if (frameCnt % 60 === 1) {
            //   addBullet(73, currentOffsettedFrame, {defX: myDefX + 80, defY: myDefY, toX: player.x, toY: player.y});
            // } else if (frameCnt % 60 === 31) {
            //   addBullet(73, currentOffsettedFrame, {defX: myDefX - 80, defY: myDefY, toX: player.x, toY: player.y});
            // }
            if ((frameCnt + 5) % 4 === 1) {
              randomDegree = myFloor(myRandom() * 360);
              for (let i = 0; i < 8; i++) {
                addBullet(71, currentOffsettedFrame, {defX: myDefX, defY: myDefY, radius: 80, offsetDegree: randomDegree + 45 * i});
              }
            }
          }
          break;
        case 0.9:
        case 1.9:
        case 2.9:
        case 3.9:
        case 4.9:
        case 5.9:
        // case 6.9:
          if (bullets.length > 0) {
            setEraseBullets(myFloor(bullets.length * 0.1) + 10);
          }
          scoreRatio += 2;
          if (prevPattern !== currentPtn[2]) {
            player.life++;
            prevPattern = currentPtn[2];
          }
          break;
        case 6.9:
          isEnd = true;
          // 某STGラストのアレの再現率上げたやつ
          // if (frameCnt % 24 === 1) {
          //   addBullet(30, currentOffsettedFrame, [90, 150, 310, false, -4]);
          //   addBullet(30, currentOffsettedFrame, [270, 150, 310, true, STAGE_WIDTH + 4]);
          // }
          // if (frameCnt % 300 > 60 && frameCnt % 8 === 1) {
          //   addBullet(31, currentOffsettedFrame, []);
          //   // addBullet(32, currentOffsettedFrame, []);
          // }
          break;
      }
    }

    function refreshText() {
      var showedTotalScore = myFloor(totalScore);
      var textAlpha = (player.y < STAGE_HEIGHT - 40) ? 1 : 0.3;
      var lifeTxt = '';
      // if (prevTotalScore != totalScore) {
        // prevTotalScore = totalScore;
        textObj.scoreNum.setText(showedTotalScore + '0');
      // }

      if (prevScoreRatio != scoreRatio) {
        prevScoreRatio = scoreRatio;
        textObj.buzzNum.setText('x' + scoreRatio);
      }

      if (player.prevLife != player.life) {
        player.prevLife = player.life;
        for (var i = 1; i < player.life; i++) {
          lifeTxt += '■';
        }
        textObj.life.setText(lifeTxt);
      }

      if (remainingTime !== prevRemainingTime) {
        prevRemainingTime = remainingTime;
        textObj.remainingTimeNum.setText(remainingTime + '');
      }

      if (overallRemainingTime !== prevOverallRemainingTime) {
        prevOverallRemainingTime = overallRemainingTime;
        textObj.overallRemainingTime.setText('/ ' + overallRemainingTime);
      }

      textObj.remainingTimeTtl.alpha = textAlpha;
      textObj.remainingTimeNum.alpha = textAlpha;
      textObj.overallRemainingTime.alpha = textAlpha;
    }

    function setSpAtkUsable() {
      if (spatk.isUsed !== true) {
        // 前回閉じてから1.5秒以内はだめです 2割残ってないとだめです
        spatk.usable = (frameCnt > spatk.changedFrame + 60 && spatk.life > 2000);
      } else {
        // 前回開いてから0.2秒以内はだめです 2割残ってないとだめです
        spatk.usable = (frameCnt > spatk.changedFrame + 12 && spatk.life > 2000);
      }
    }

    function changeSpAtk() {
      // ライフが一定値以上ある時に限る方がいい と思ったけど鬼畜だなあ 1以上なら良しとしよう
      if (spatk.isUsed !== true) {
        if (spatk.usable) {
          spatk.changedFrame = frameCnt;
          spatk.isUsed = true;
          spatk.x = player.x;
          spatk.y = player.y;
          containers[layerIDs.spatk].addChild(spatk);
        }
      } else {
        if (spatk.usable) {
          spatk.changedFrame = frameCnt;
          spatk.isUsed = false;
          containers[layerIDs.spatk].removeChild(spatk);
        }
      }
    }

    function drawSpAtk() {
      // try {
      //   var myIndex = containers[layerIDs.spatk].getChildIndex(spatkArc);
        containers[layerIDs.spatk].removeChild(spatkArc);
        spatkArc = null;
      // } catch (e) {
      //   // console.log(e);
      // } finally {
      //   // console.log('done');
      // }
      if (spatk.isUsed === true) {
        spatkArc = new PIXI.Graphics();
        spatkArc.lineStyle(3, 0x0075c2, 0.7);
        spatkArc.arc(spatk.x, spatk.y, 80, toRadian(270), toRadian(myFloor(spatk.life * 360 * 0.0001) + 270));
        containers[layerIDs.spatk].addChild(spatkArc);
      }
    }

    function moveBits() {
      var myCnt = bits.length;
      for (var i = 0; i < myCnt; i++) {
        if (bits[i].alpha > 0.1) {
          bits[i].alpha *= 0.95;
        } else {
          bits[i].erase = true;
        }
      }

      eraseBits();

      addBits();
    }

    function eraseBits() {
      // console.log(bits.length);
      for (var i = bits.length - 1, j = 0; i >= j; i--) {
        if (bits[i].erase === true) {
          containers[layerIDs.bg[bits[i].layer]].removeChild(bits[i]);
          bits.splice(i, 1);
          // console.log('erase');
        }
      }
    }

    function addBits() {
      var myBit;
      var maxRadius = 80;
      var minRadius = 40;
      if (player.keySlow && currentBitRadius > minRadius) {
        currentBitRadius -= 4;
      } else if (!player.keySlow && currentBitRadius < maxRadius) {
        currentBitRadius += 4;
      }

      for (var i = 0; i < 2; i++) {
        // if (spatk.usable !== spatk.prevUsable) {
          if (spatk.usable || spatk.isUsed) {
            myBit = new Sprite(textureBit);
          } else {
            myBit = new Sprite(textureBitDisabled);
          }
          // spatk.prevUsable = spatk.usable;
        // }
        myBit.radius = currentBitRadius;
        // myBit.maxRadius = 80;
        // myBit.minRadius = 40;
        myBit.x = player.x;
        myBit.y = player.y - myBit.radius;
        myBit.anchor.x = 0.5;
        myBit.anchor.y = 0.5;
        // myBit.spd = 4;
        // myBit.degree = frameCnt % (360 / myBit.spd) * myBit.spd + i * (360 / 2);
        myBit.degree = (frameCnt % 90) * 4 + (180 * i);// 上2行を短縮
        if (myBit.degree > 360) myBit.degree -= 360;
        myBit.radian = toRadian(myBit.degree);
        myBit.alpha = 1;
        myBit.layer = 1;
        myBit.erase = false;
        myBit.blendMode = PIXI.BLEND_MODES.ADD;
        myBit.x = myBit.radius * myCos(myBit.radian) + player.x;
        myBit.y = myBit.radius * mySin(myBit.radian) + player.y;

        containers[layerIDs.bg[myBit.layer]].addChild(myBit);
        bits[bits.length] = myBit;
      }
    }

    function addBullet(ptn, offsettedFrame, myOptions) {
      // myTrace('addBullet');
      var bullet, myCnt;

      switch (ptn) {
        case 0:
        case 2:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          // bullet.hitWidth = 2;
          // bullet.hitHeight = 2;
          bullet.alpha = 1;
          bullet.hitRadius = 2;//実質的当たり判定の幅と高さ めり込むくらいがちょうどいい 半径でいい
          bullet.defX = myFloor(myRandom() * (STAGE_WIDTH + 230) - 115);
          bullet.defY = -8;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.lastX = bullet.defX;// 前フレームの座標
          bullet.lastY = bullet.defY;// 同上
          bullet.eraseX = 10;//この数値だけステージからはみ出たら消える
          bullet.eraseY = 10;//同上
          // bullet.rotation = 0;
          bullet.vec = [[0,1],[0,0]];// かかっているベクトルを二次元配列で
          bullet.nVec = [];// 上のを正規化後
          bullet.spd = 3;// 移動速度 ベクトルの大きさ
          bullet.atk = 100;// 傘に当たった時に削る耐久力
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 1:
        case 3:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          bullet.alpha = 1;
          bullet.hitRadius = 2;
          bullet.defX = myFloor(myRandom() * (STAGE_WIDTH + 230) - 115);
          bullet.defY = -8;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 2;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.toX = bullet.defX + myFloor(myRandom() * (myOptions[0] + 1)) - (myOptions[0] >> 1);
          bullet.toY = bullet.defY + STAGE_HEIGHT;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 10:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          bullet.alpha = 1;
          bullet.hitRadius = 2;
          bullet.defX = myFloor(myRandom() * (STAGE_WIDTH + 1));
          bullet.defY = -8;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 3;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 30:
          for (myCnt = 0; myCnt < 12; myCnt++) {
            bullet = new Sprite(textureSnow8);
            bullet.layer = 0;
            bullet.width = 8;
            bullet.height = 8;
            bullet.alpha = 1;
            bullet.hitRadius = 2;
            bullet.defX = myOptions[4];
            bullet.defY = 78 * myCnt + 8 - 78;
            bullet.x = bullet.defX;
            bullet.y = bullet.defY;
            bullet.anchor.x = 0.5;
            bullet.anchor.y = 0.5;
            bullet.lastX = bullet.defX;
            bullet.lastY = bullet.defY;
            bullet.eraseX = 10;
            bullet.eraseY = 10;
            bullet.vec = [[0,1],[0,0]];
            bullet.spd = 1.6;
            bullet.atk = 100;
            bullet.ptn = ptn;
            bullet.createdFrame = frameCnt;
            bullet.offsettedFrame = offsettedFrame;
            bullet.erase = false;
            bullet.buzzed = false;
            bullet.option0 = myOptions[0];
            bullet.option1 = myOptions[1];
            bullet.option2 = myOptions[2];
            bullet.option3 = myOptions[3];
            bullet.option4 = myOptions[4];
            bullet.option5 = myOptions[5];
            bullet.nVec = getNVec(ptn, bullet);
            containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
            bullets[bullets.length] = bullet;
          }
          break;
        case 31:
          bullet = new Sprite(textureSnow16);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          bullet.alpha = 1;
          bullet.hitRadius = 2;
          bullet.defX = myFloor(myRandom() * (STAGE_WIDTH + 230) - 115);
          bullet.defY = -8;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.vec = [[0,1],[0,0]];
          bullet.nVec = [];
          bullet.spd = 2.5;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 32:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 6;
          bullet.height = 6;
          bullet.alpha = 1;
          bullet.hitRadius = 1;
          bullet.defX = myFloor(myRandom() * (STAGE_WIDTH + 1));
          bullet.defY = -8;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 3;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 40:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          bullet.alpha = 1;
          bullet.hitRadius = 2;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 0;
          bullet.spdMax = 4;
          bullet.spdI = 0.02;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = (bullet.offsettedFrame !== 0) ? (bullet.offsettedFrame % (myOptions[2] * 360)) / myOptions[2] + myOptions[3] : 0;
          if (bullet.degree > 360) bullet.degree -= 360;
          if (myOptions[4] === true) bullet.degree = 360 - bullet.degree;
          bullet.radian = toRadian(bullet.degree);
          bullet.defX = myOptions[0][0] * myCos(bullet.radian) - myOptions[0][1] * mySin(bullet.radian) + player.x;
          bullet.defY = myOptions[0][0] * mySin(bullet.radian) + myOptions[0][1] * myCos(bullet.radian) + player.y;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.toX = myOptions[1][0] * myCos(bullet.radian) - myOptions[1][1] * mySin(bullet.radian) + player.x;
          bullet.toY = myOptions[1][0] * mySin(bullet.radian) + myOptions[1][1] * myCos(bullet.radian) + player.y;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 41:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 6;
          bullet.height = 6;
          bullet.alpha = 1;
          bullet.hitRadius = 1;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 2;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = (bullet.offsettedFrame !== 0) ? (bullet.offsettedFrame % (myOptions[2] * 360)) / myOptions[2] + myOptions[3] : 0;
          if (bullet.degree > 360) bullet.degree -= 360;
          if (myOptions[4] === true) bullet.degree = 360 - bullet.degree;
          bullet.radian = toRadian(bullet.degree);
          bullet.radius = (bullet.offsettedFrame > 200) ? myOptions[0][1] : myOptions[0][1] + (200 - bullet.offsettedFrame);
          bullet.defX = myOptions[0][0] * myCos(bullet.radian) - myOptions[0][1] * mySin(bullet.radian) + (STAGE_WIDTH >> 1);
          bullet.defY = myOptions[0][0] * mySin(bullet.radian) + myOptions[0][1] * myCos(bullet.radian) + (STAGE_HEIGHT >> 1);
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.toX = player.x + myFloor(myRandom() * (myOptions[1] + 1)) - (myOptions[1] >> 1);
          bullet.toY = player.y + myFloor(myRandom() * (myOptions[1] + 1)) - (myOptions[1] >> 1);
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 42:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 6;
          bullet.height = 6;
          bullet.alpha = 1;
          bullet.hitRadius = 1;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 2;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = (bullet.offsettedFrame !== 0) ? (bullet.offsettedFrame % (myOptions[2] * 360)) / myOptions[2] + myOptions[3] : 0;
          if (bullet.degree > 360) bullet.degree -= 360;
          if (myOptions[4] === true) bullet.degree = 360 - bullet.degree;
          bullet.radian = toRadian(bullet.degree);
          bullet.radius = (bullet.offsettedFrame > 200) ? myOptions[0][1] : myOptions[0][1] + (200 - bullet.offsettedFrame);
          bullet.defX = myOptions[0][0] * myCos(bullet.radian) - bullet.radius * mySin(bullet.radian) + (STAGE_WIDTH >> 1);
          bullet.defY = myOptions[0][0] * mySin(bullet.radian) + bullet.radius * myCos(bullet.radian) + (STAGE_HEIGHT >> 1);
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 10;
          bullet.eraseY = 10;
          bullet.toX = bullet.defX + myFloor(myRandom() * (myOptions[1] + 1)) - (myOptions[1] >> 1);
          bullet.toY = bullet.defY + STAGE_HEIGHT * myOptions[4];
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 43:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          bullet.alpha = 1;
          bullet.hitRadius = 2;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 0;
          bullet.spdMax = 6;
          bullet.spdI = 0.01;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = (bullet.offsettedFrame !== 0) ? (bullet.offsettedFrame % (myOptions[2] * 360)) / myOptions[2] + myOptions[3] : 0;
          if (bullet.degree > 360) bullet.degree -= 360;
          if (myOptions[4] === true) bullet.degree = 360 - bullet.degree;
          bullet.radian = toRadian(bullet.degree);
          bullet.radius = (bullet.offsettedFrame > 200) ? myOptions[0][1] : myOptions[0][1] + (200 - bullet.offsettedFrame);
          bullet.defX = myOptions[0][0] * myCos(bullet.radian) - bullet.radius * mySin(bullet.radian) + (STAGE_WIDTH >> 1);
          bullet.defY = myOptions[0][0] * mySin(bullet.radian) + bullet.radius * myCos(bullet.radian) + (STAGE_HEIGHT >> 1);
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 128;
          bullet.eraseY = 128;
          bullet.toX = myOptions[1][0] * myCos(bullet.radian) - myOptions[1][1] * mySin(bullet.radian) + (STAGE_WIDTH >> 1);
          bullet.toY = myOptions[1][0] * mySin(bullet.radian) + myOptions[1][1] * myCos(bullet.radian) + (STAGE_HEIGHT >> 1);
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 50:
          for (myCnt = 0; myCnt < myOptions[0]; myCnt++) {
            bullet = new Sprite(textureSnow8);
            bullet.layer = 0;
            bullet.width = 8;
            bullet.height = 8;
            bullet.alpha = 1;
            bullet.hitRadius = 2;
            bullet.defX = STAGE_WIDTH >> 1;
            bullet.defY = 80;
            bullet.x = bullet.defX;
            bullet.y = bullet.defY;
            bullet.anchor.x = 0.5;
            bullet.anchor.y = 0.5;
            bullet.lastX = bullet.defX;
            bullet.lastY = bullet.defY;
            bullet.eraseX = 10;
            bullet.eraseY = 10;
            bullet.vec = [[0,1],[0,0]];
            bullet.spd = -5.5;
            bullet.spdMax = 3;
            bullet.spdI = 0.04;
            bullet.atk = 100;
            bullet.ptn = ptn;
            bullet.createdFrame = frameCnt;
            bullet.offsettedFrame = offsettedFrame;
            bullet.erase = false;
            bullet.buzzed = false;
            bullet.degree = (360 / myOptions[0] * myCnt) + myOptions[2];
            if (bullet.degree > 360) bullet.degree -= 360;
            bullet.radian = toRadian(bullet.degree);
            bullet.toX = myOptions[1][0] * myCos(bullet.radian) - myOptions[1][1] * mySin(bullet.radian) + bullet.x;
            bullet.toY = myOptions[1][0] * mySin(bullet.radian) + myOptions[1][1] * myCos(bullet.radian) + bullet.y;
            // console.log(bullet.toX, bullet.toY, bullet.radian);
            bullet.nVec = getNVec(ptn, bullet);
            containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
            bullets[bullets.length] = bullet;
          }
          break;
        case 60:
          for (myCnt = 0; myCnt < 12; myCnt++) {
            bullet = new Sprite(textureSnow16);
            bullet.layer = 0;
            bullet.width = 12;
            bullet.height = 12;
            bullet.alpha = 1;
            // bullet.alpha = myRandom() * 0.6 + 0.4;
            bullet.hitRadius = 3;
            bullet.defX = 78 * myCnt + 8 - 78;
            bullet.defX = (myOptions[3]) ? bullet.defX - ((offsettedFrame * 0.1) % 78) : bullet.defX + ((offsettedFrame * 0.1) % 78);
            bullet.defY = myOptions[4];
            bullet.x = bullet.defX;
            bullet.y = bullet.defY;
            bullet.anchor.x = 0.5;
            bullet.anchor.y = 0.5;
            bullet.lastX = bullet.defX;
            bullet.lastY = bullet.defY;
            bullet.eraseX = 400;
            bullet.eraseY = 10;
            bullet.vec = [[0,1],[0,0]];
            bullet.spd = 1.6;
            bullet.atk = 100;
            bullet.ptn = ptn;
            bullet.createdFrame = frameCnt;
            bullet.offsettedFrame = offsettedFrame;
            bullet.erase = false;
            bullet.buzzed = false;
            bullet.option0 = myOptions[0];
            bullet.option1 = myOptions[1];
            bullet.option2 = myOptions[2];
            bullet.option3 = myOptions[3];
            bullet.option4 = myOptions[4];
            bullet.option5 = myOptions[5];
            bullet.nVec = getNVec(ptn, bullet);
            containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
            bullets[bullets.length] = bullet;
            // bullet.blendMode = PIXI.BLEND_MODES.ADD;

            // bullet.blendMode = PIXI.BLEND_MODES.NORMAL;
            // bullet.blendMode = PIXI.BLEND_MODES.MULTIPLY;
            // bullet.blendMode = PIXI.BLEND_MODES.SCREEN;
            // bullet.blendMode = PIXI.BLEND_MODES.OVERLAY;
            // bullet.blendMode = PIXI.BLEND_MODES.DARKEN;
            // bullet.blendMode = PIXI.BLEND_MODES.LIGHTEN;
          }
          break;
        case 70:
          bullet = new Sprite(textureSnow8);
          bullet.layer = 0;
          bullet.width = 8;
          bullet.height = 8;
          bullet.alpha = 1;
          bullet.hitRadius = 2;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 1;
          bullet.spdMax = 3;
          bullet.spdI = 0.02;
          bullet.atk = 100;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = (bullet.offsettedFrame !== 0) ? (bullet.offsettedFrame % 1440) * 0.25 + myOptions.offsetDegree : myOptions.offsetDegree;
          if (bullet.degree > 360) bullet.degree -= 360;
          if (myOptions.isReverse === true) bullet.degree = 360 - bullet.degree;
          bullet.radian = toRadian(bullet.degree);
          bullet.defX = myOptions.defX;
          bullet.defY = myOptions.defY;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 16;
          bullet.eraseY = 16;
          bullet.toX = myOptions.radius * myCos(bullet.radian) + myOptions.defX;
          bullet.toY = myOptions.radius * mySin(bullet.radian) + myOptions.defY;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 71:
          bullet = new Sprite(textureSnow16);
          bullet.layer = 0;
          bullet.width = 16;
          bullet.height = 16;
          bullet.alpha = 1;
          bullet.hitRadius = 4;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 0;
          bullet.spdMax = 5;
          bullet.spdI = 0.015;
          bullet.atk = 800;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = myOptions.offsetDegree;
          if (bullet.degree > 360) bullet.degree -= 360;
          bullet.radian = toRadian(bullet.degree);
          bullet.defX = myOptions.defX;
          bullet.defY = myOptions.defY;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 24;
          bullet.eraseY = 24;
          bullet.toX = myOptions.radius * myCos(bullet.radian) + myOptions.defX;
          bullet.toY = myOptions.radius * mySin(bullet.radian) + myOptions.defY;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 72:
          bullet = new Sprite(textureSnow16);
          bullet.layer = 0;
          bullet.width = 12;
          bullet.height = 12;
          bullet.alpha = 1;
          bullet.hitRadius = 4;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 1;
          bullet.spdMax = 4;
          bullet.spdI = 0.05;
          bullet.atk = 200;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.degree = myOptions.offsetDegree;
          if (bullet.degree > 360) bullet.degree -= 360;
          bullet.radian = toRadian(bullet.degree);
          bullet.defX = myOptions.defX;
          bullet.defY = myOptions.defY;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 16;
          bullet.eraseY = 16;
          bullet.toX = myOptions.radius * myCos(bullet.radian) + myOptions.defX;
          bullet.toY = myOptions.radius * mySin(bullet.radian) + myOptions.defY;
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
        case 73:
          bullet = new Sprite(textureSnow48);
          bullet.layer = 0;
          bullet.width = 24;
          bullet.height = 24;
          bullet.alpha = 1;
          bullet.hitRadius = 8;
          bullet.anchor.x = 0.5;
          bullet.anchor.y = 0.5;
          bullet.vec = [[0,1],[0,0]];
          bullet.spd = 0.1;
          bullet.spdMax = 3;
          bullet.spdI = 0.04;
          bullet.atk = 2000;
          bullet.ptn = ptn;
          bullet.createdFrame = frameCnt;
          bullet.offsettedFrame = offsettedFrame;
          bullet.erase = false;
          bullet.buzzed = false;
          bullet.defX = myOptions.defX;
          bullet.defY = myOptions.defY;
          bullet.x = bullet.defX;
          bullet.y = bullet.defY;
          bullet.lastX = bullet.defX;
          bullet.lastY = bullet.defY;
          bullet.eraseX = 32;
          bullet.eraseY = 32;
          if (myOptions.defX !== myOptions.toX && myOptions.defY !== myOptions.toY) {
            bullet.toX = myOptions.toX;
            bullet.toY = myOptions.toY;
          } else {
            bullet.toX = myOptions.toX;
            bullet.toY = 80;
          }
          bullet.nVec = getNVec(ptn, bullet);
          containers[layerIDs.bullet[bullet.layer]].addChild(bullet);
          bullets[bullets.length] = bullet;
          break;
      }
    }

    function getNVec(ptn, bullet) {
      var vec0, vec1, vec2, synVecX, synVecY, len, nVec = [0, 0];
      switch (ptn) {
        case 1:
        case 3:
        case 40:
        case 41:
        case 42:
        case 43:
        case 50:
        case 70:
        case 71:
        case 72:
        case 73:
          // synVec = [player.x - bullet.x, player.y - bullet.y];
          synVecX = bullet.toX - bullet.x;
          synVecY = bullet.toY - bullet.y;
          len = myHypot(synVecX, synVecY);
          if (len !== 0) {
            nVec = [synVecX / len, synVecY / len];
          } else {
            nVec = [0, 1];
          }
          break;
        case 10:
          synVecX = player.x - bullet.x;
          synVecY = player.y - bullet.y;
          len = myHypot(synVecX, synVecY);
          if (len !== 0) {
            nVec = [synVecX / len, synVecY / len];
          } else {
            nVec = [0, 1];
          }
          break;
        case 30:
          // vec0 = (bullet.offsettedFrame * 0.1 + bullet.option1) % 360;
          // vec0 = mySin(toRadian(vec0)) * 30 + bullet.option0;
          // vec0 = toRadian(vec0);
          vec0 = toRadian(mySin(toRadian((bullet.offsettedFrame * 0.1 + bullet.option1) % 360)) * 30 + bullet.option0);//上3行の短縮。何か非効率なような
          synVecX = mySin(vec0);
          synVecY = myCos(vec0);
          len = myHypot(synVecX, synVecY);
          if (len !== 0) {
            nVec = [synVecX / len, synVecY / len];
          } else {
            nVec = [0, 0];
          }
          if (bullet.option2 > bullet.offsettedFrame) {
            if (bullet.option3 === false) {
              nVec[0] = 1;
            } else {
              nVec[0] = -1;
            }
            nVec[1] = 0;
          }
          break;
        case 31:
          synVecX = bullet.vec[0][0] + bullet.vec[1][0];
          synVecY = bullet.vec[0][1] + bullet.vec[1][1];
          len = myHypot(synVecX, synVecY);
          if (len !== 0) {
            nVec = [synVecX / len, synVecY / len];
          } else {
            nVec = [0, 0];
          }
          break;
        case 32:
          synVecX = player.x - bullet.x;
          synVecY = player.y - bullet.y;
          len = myHypot(synVecX, synVecY);
          if (len !== 0) {
            nVec = [synVecX / len, synVecY / len];
          } else {
            nVec = [0, 1];
          }
          break;
        case 60:
          // いらない わすれた
          // vec0 = (bullet.offsettedFrame * 0.15 + bullet.option1) % 360;
          // vec0 = mySin(toRadian(vec0)) * 30 + bullet.option0;
          // vec0 = toRadian(vec0);

          // 傾ける場合
          // vec0 = toRadian(mySin(toRadian((bullet.offsettedFrame * 0.15 + bullet.option1) % 360)) * 30 + bullet.option0);//上3行の短縮
          // synVecX = myCos(vec0);
          // synVecY = mySin(vec0);
          // len = myHypot(synVecX, synVecY);
          // if (len !== 0) {
          //   nVec = [synVecX / len, synVecY / len];
          // } else {
          //   nVec = [0, 0];
          // }
          // if (bullet.option2 > bullet.offsettedFrame) {
          //   if (bullet.option3 === false) {
          //     nVec[1] = 1;
          //   } else {
          //     nVec[1] = -1;
          //   }
          //   nVec[0] = 0;
          // }

          // 傾けない場合
          // if (bullet.option2 > bullet.offsettedFrame) {
            if (bullet.option3 === false) {
              nVec = [0, 1];
            } else {
              nVec = [0, -1];
            }
          // }
          // nVec = [0, -1];
          break;
      }
      return nVec;
    }

    function moveBullets() {
      var synVecX, synVecY, len, vx, vy, vec0, vec1, vec2;
      for (var i = 0, j = bullets.length; i < j; i++) {
        // この時点での座標を格納
        bullets[i].lastX = bullets[i].x;
        bullets[i].lastY = bullets[i].y;

        switch (bullets[i].ptn) {
          case 3:// 普通の等速直線運動
          case 10:
          case 30:
          case 31:
          case 32:
          case 41:
          case 42:
          case 60:
            bullets[i].x = bullets[i].lastX + bullets[i].nVec[0] * bullets[i].spd;
            bullets[i].y = bullets[i].lastY + bullets[i].nVec[1] * bullets[i].spd;
            break;
          case 0:
            // ベクトルを求めて移動後の座標を計算し移動
            bullets[i].vec[1] = [bullets[i].vec[1][0] - 0.002, 0];// ちょっと風を
            if (bullets[i].vec[1][0] > 0.1) {
              bullets[i].vec[1][0] = 0.1;
            }
            synVecX = bullets[i].vec[0][0] + bullets[i].vec[1][0];
            synVecY = bullets[i].vec[0][1] + bullets[i].vec[1][1];// ベクトル合成
            len = myHypot(synVecX, synVecY);// ベクトルの長さ
            if (len !== 0) {
              bullets[i].nVec = [synVecX / len, synVecY / len];// 正規化
            } else {
              bullets[i].nVec = [0, 0];
            }
            bullets[i].x = bullets[i].lastX + bullets[i].nVec[0] * bullets[i].spd;
            bullets[i].y = bullets[i].lastY + bullets[i].nVec[1] * bullets[i].spd;
            break;
          case 1:
            bullets[i].vec[1] = [bullets[i].vec[1][0] - 0.001, 0];// ちょっと風を
            if (bullets[i].vec[1][0] > 0.05) {
              bullets[i].vec[1][0] = 0.05;
            }
            synVecX = bullets[i].vec[0][0] + bullets[i].vec[1][0];
            synVecY = bullets[i].vec[0][1] + bullets[i].vec[1][1];
            len = myHypot(synVecX, synVecY);
            if (len !== 0) {
              bullets[i].nVec = [synVecX / len, synVecY / len];
            } else {
              bullets[i].nVec = [0, 0];
            }
            bullets[i].x = bullets[i].lastX + bullets[i].nVec[0] * bullets[i].spd;
            bullets[i].y = bullets[i].lastY + bullets[i].nVec[1] * bullets[i].spd;
            break;
          case 40:
          case 43:
          case 70:
          case 71:
          case 72:
          case 73:
            if (bullets[i].spd < bullets[i].spdMax) bullets[i].spd += bullets[i].spdI;
            bullets[i].x = bullets[i].lastX + bullets[i].nVec[0] * bullets[i].spd;
            bullets[i].y = bullets[i].lastY + bullets[i].nVec[1] * bullets[i].spd;
            break;
          case 50:
            if (bullets[i].spd < bullets[i].spdMax) bullets[i].spd += bullets[i].spdI;
            bullets[i].x = bullets[i].lastX + bullets[i].nVec[0] * myAbs(bullets[i].spd);
            bullets[i].y = bullets[i].lastY + bullets[i].nVec[1] * myAbs(bullets[i].spd);
            break;
        }

        if (bullets[i].x < -bullets[i].eraseX || bullets[i].x > STAGE_WIDTH + bullets[i].eraseX || bullets[i].y < -bullets[i].eraseY || bullets[i].y > STAGE_HEIGHT + bullets[i].eraseY) {
          bullets[i].erase = true;
        }
      }
    }

    function setEraseBullets(num) {
      var myLength;
      if (num > bullets.length) {
        myLength = bullets.length;
      } else {
        myLength = num;
      }
      for (var i = 0; i < myLength; i++) {
        bullets[i].erase = true;
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

    function spHitCheck() {
      if (spatk.isUsed !== true) {//使ってなかったら回復
        if (spatk.life < 10000) {
          spatk.life += 20;
          if (spatk.life > 10000) {
            spatk.life = 10000;
          }
        }
      } else {//使ってたら以下
        var mySPX = spatk.x,
            mySPY = spatk.y,
            mySPRadius = spatk.hitRadius,
            myBltX,
            myBltY,
            myHitRadius;// いろいろローカルにキャッシュしておくと早そうなので

        for (var i = 0, j = bullets.length; i < j; i++) {
          myHitRadius = bullets[i].hitRadius + mySPRadius;
          myBltX = bullets[i].x;
          myBltY = bullets[i].y;
          if (myAbs(myBltX - mySPX) < myHitRadius && myAbs(myBltY - mySPY) < myHitRadius) {//先に軽く矩形で判定し、通った場合のみ半径で判定する
            // myTrace('check');
            if (myPow2(myBltX - mySPX) + myPow2(myBltY - mySPY) <= myHitRadius * myHitRadius) {//平方根はおそそうだから使わず二乗のまま比較する
              spatk.life -= bullets[i].atk;
              bullets[i].erase = true;
              // myTrace('sp hit!');
            }
          }
        }

        spatk.life -= 20;

        if (spatk.life < 0) {
          spatk.life = -1000;//壊れちゃったらしばらく使えないのを擬似的に。いくらなんでもつらそうならやめとく。出し入れ一秒ペナルティあるしねえ
          // spatk.life = 0;//やさしくてもいいと思う
          // 以下で強制的に消しちゃう
          spatk.changedFrame = frameCnt;
          spatk.isUsed = false;
          spatk.usable = false;
          containers[layerIDs.spatk].removeChild(spatk);
        }
      }
    }

    function buzzCheck() {
      if (!player.isInvincible) {
        var myPlayerX = player.x,
            myPlayerY = player.y,
            myPlayerRadius = player.buzzRadius,
            myBuzzRadius;
        for (var i = 0, j = bullets.length; i < j; i++) {
          if (bullets[i].erase !== true) {// もう何か（たぶん傘）に当たってるものは判定しない
            myBuzzRadius = bullets[i].hitRadius + myPlayerRadius;

            if (myAbs(bullets[i].x - myPlayerX) < myBuzzRadius && myAbs(bullets[i].y - myPlayerY) < myBuzzRadius) {
              if (bullets[i].buzzed !== true) {
                buzzCnt++;
                scoreRatio++;
                bullets[i].buzzed = true;
                // myTrace('buzz!');
              }
              if (player.isHit !== true) {
                hitCheck(i);
              }
            }
          }
        }
      }
    }

    function hitCheck(num) {
      var myPlayerX = player.x,
          myPlayerY = player.y,
          myPlayerRadius = player.hitRadius,
          myHitRadius;// いろいろキャッシュしておくと早そうなので

      myHitRadius = bullets[num].hitRadius + myPlayerRadius;
      if (myAbs(bullets[num].x - myPlayerX) < myHitRadius && myAbs(bullets[num].y - myPlayerY) < myHitRadius) {// 矩形で判定するほうが速いので
        player.isHit = true;
        bullets[num].erase = true;
        // myTrace('hit!');
      }
    }


    function onHit() {
      if (player.isHit === true) {
        player.life -= 1;
        // myTrace(['life:', player.life]);
        player.x = player.defX;
        player.y = player.defY;
        player.isHit = false;
        scoreRatio = myFloor(scoreRatio >> 1);//スコア倍率半分
        if (scoreRatio < 1) scoreRatio = 1;
        player.isInvincible = true;
        player.hittedFrame = frameCnt;
      }
    }


    function addScore() {
      totalScore += scoreRatio * rawScore * 0.01;
    }

    function movePlayer() {
      var playerOpacity;
      if (isKeyboard === true) {
        //keyboard
        var playerSpd = (player.keySlow !== true) ? player.spd : player.spdSlow;
        playerOpacity = (player.keySlow !== true) ? 0.5 : 1;
        if (player.keyUp === true) {
          if (player.keyLeft === true) {
            player.vx = myFloor(playerSpd * -7) * 0.1;
            player.vy = myFloor(playerSpd * -7) * 0.1;
          } else if (player.keyRight === true) {
            player.vx = myFloor(playerSpd * 7) * 0.1;
            player.vy = myFloor(playerSpd * -7) * 0.1;
          } else {
            player.vx = 0;
            player.vy = playerSpd * -1;
          }
        } else if (player.keyDown === true) {
          if (player.keyLeft === true) {
            player.vx = myFloor(playerSpd * -7) * 0.1;
            player.vy = myFloor(playerSpd * 7) * 0.1;
          } else if (player.keyRight === true) {
            player.vx = myFloor(playerSpd * 7) * 0.1;
            player.vy = myFloor(playerSpd * 7) * 0.1;
          } else {
            player.vx = 0;
            player.vy = playerSpd;
          }
        } else if (player.keyLeft === true) {
          player.vx = playerSpd * -1;
          player.vy = 0;
        } else if (player.keyRight === true) {
          player.vx = playerSpd;
          player.vy = 0;
        } else {
          player.vx = 0;
          player.vy = 0;
        }
        player.x += player.vx;
        player.y += player.vy;
      } else {
        // mouse
        playerOpacity = 1;
        player.x = player.mouseX;
        player.y = player.mouseY;
      }

      // 共通
      if (player.x > STAGE_WIDTH - (player.width >> 1)) {
        player.x = STAGE_WIDTH - (player.width >> 1);
      } else if (player.x < (player.width >> 1)) {
        player.x = (player.width >> 1);
      }
      if (player.y > STAGE_HEIGHT - (player.height >> 1)) {
        player.y = STAGE_HEIGHT - (player.height >> 1);
      } else if (player.y < (player.height >> 1)) {
        player.y = (player.height >> 1);
      }
      player.alpha = playerOpacity;


      if (player.isInvincible && frameCnt > player.hittedFrame + 180) {
        player.isInvincible = false;
      }
    }


    function keyboard(keyCode) {
      var key = {};
      key.code = keyCode;
      key.isDown = false;
      key.isUp = true;
      key.press = undefined;
      key.release = undefined;

      key.downHandler = function(event) {
        if (event.keyCode === key.code) {
          if (key.isUp && key.press) key.press();
          key.isDown = true;
          key.isUp = false;
          // myTrace(key + 'isDown');
        }
        event.preventDefault();
      };

      key.upHandler = function(event) {
        if (event.keyCode === key.code) {
          if (key.isDown && key.release) key.release();
          key.isDown = false;
          key.isUp = true;
          // myTrace(key + 'isUp');
        }
        event.preventDefault();
      };

      window.addEventListener(
        "keydown", key.downHandler.bind(key), false
      );
      window.addEventListener(
        "keyup", key.upHandler.bind(key), false
      );
      return key;
    }



    function callBG() {
      // 共通で使うものを宣言
      var moveSpeed = (difficulty === 'hard') ? 1 : 0.25;
      var textureLoader = new THREE.TextureLoader();
      textureLoader.crossOrigin = '*';


      // レンダラの作成
      var rendererT = new THREE.WebGLRenderer({antialias:true, alpha: true});
      rendererT.autoClear = false;
      // rendererT.autoClearColor = false;
      rendererT.setPixelRatio(1);
      rendererT.shadowMap.enabled = true;
      // rendererT.setClearColor(0xcccccc, 1);
      rendererT.setClearColor(fogColor, 1);
      rendererT.setSize( STAGE_WIDTH, STAGE_HEIGHT );
      document.body.appendChild( rendererT.domElement ).setAttribute( 'class', 'c-motion' );

      if (difficulty === 'hard') {
        $('.c-motion').addClass('t-hard');
      }


      // 箱のシーン
      var scenePlayer = new THREE.Scene();

      var cameraPlayer = new THREE.OrthographicCamera (0, STAGE_WIDTH, STAGE_HEIGHT, 0, 0, 1000);
      cameraPlayer.position.z = 8;

      cameraPlayer.position.set(0, 0, 0);
      // cameraPlayer.lookAt({x: 20, y: 25, z: -40});

      var geometryPlayer = new THREE.BoxGeometry( 16, 16, 16 );
      var materialPlayer = new THREE.MeshLambertMaterial( { color: 0x00ff88, transparent: true, opacity:1 } )

      // var ambientLight = new THREE.AmbientLight(0xffffff);
      // ambientLight.color.multiplyScalar(0.2);
      // scenePlayer.add( ambientLight );

      var cube = new THREE.Mesh( geometryPlayer, materialPlayer );
      cube.position.set(STAGE_WIDTH/2, STAGE_HEIGHT/2, -10);
      scenePlayer.add( cube );

      var light = new THREE.DirectionalLight(0xffffff);
      // spotLight.castShadow = true;
      light.position.set(1, 1, 1).normalize();
      scenePlayer.add( light );



      // 背景のシーン
      var sceneBG = new THREE.Scene();
      // sceneBG.fog = new THREE.Fog(0xcccccc, -96, 224);
      // sceneBG.fog = new THREE.Fog(0xcccccc, -32, 320);
      sceneBG.fog = new THREE.Fog(fogColor, -32, 320);
      // sceneBG.fog = new THREE.FogExp2(0xcccccc, 0.008);

      var cameraBG = new THREE.PerspectiveCamera(35, STAGE_WIDTH / STAGE_HEIGHT, 0.1, 1000);

      cameraBG.position.set(55, 30, 40);
      cameraBG.lookAt({x: 20, y: 25, z: -40});


      var ambientLight = new THREE.AmbientLight(0xffffff);
      ambientLight.color.multiplyScalar(0.2);
      sceneBG.add( ambientLight );

      var directionalLight = new THREE.DirectionalLight(0xffffff);
      // directionalLight.position.set(-10, 2, 0).normalize();
      directionalLight.position.set( -144, 128, 72 );
      directionalLight.target.position.copy(sceneBG.position);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.left = -384;
      directionalLight.shadow.camera.top = -384;
      directionalLight.shadow.camera.right = 384;
      directionalLight.shadow.camera.bottom = 384;
      directionalLight.shadow.camera.near = 20;
      directionalLight.shadow.camera.far = 384;
      directionalLight.shadow.bias = -0.0001;
      directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;
      sceneBG.add( directionalLight );

      let cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
      sceneBG.add(cameraHelper);


      // var cubeGeometry = new THREE.BoxGeometry( 16, 16, 16 );
      // var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff88, side: THREE.DoubleSide, transparent: false } );
      //
      // var cube = [];
      // for (let i = 0; i < 500; i++) {
      //   cube[i] = new THREE.Mesh( cubeGeometry, cubeMaterial );
      //   cube[i].position.set(myRandom() * 1000 - 500, myRandom() * 1000 - 500, myRandom() * 1000 - 500);
      //   cube[i].castShadow = true;
      //   cube[i].receiveShadow = true;
      //   sceneBG.add( cube[i] );
      // }


      var noiseGeometry = new THREE.PlaneGeometry( 256, 256, 1, 1 );
      // var simplexNoise = new SimplexNoise();
      // for ( let i = 0; i < noiseGeometry.vertices.length; i++ ) {
      //   let vertex = noiseGeometry.vertices[ i ];
      //   vertex.z = simplexNoise.noise( vertex.x / 10, vertex.y / 10 );
      // }
      // noiseGeometry.computeFaceNormals();
      // noiseGeometry.computeVertexNormals();

      // var noiseGeometry = new THREE.CylinderGeometry( 30, 30, 100, 96);

      var noiseTexture = textureLoader.load('./img/field21.png');
      // noiseTexture.wrapS = noiseTexture.wrapT = THREE.MirroredRepeatWrapping;
      // noiseTexture.repeat.set( 2, 2 );
      var noiseFields = [];
      for (var i = 0; i < 2; i++) {
        noiseFields[i] = new THREE.Mesh( noiseGeometry, new THREE.MeshLambertMaterial( { /*color: 0xdddddd,*/ map: noiseTexture, side: THREE.DoubleSide } ) );
        noiseFields[i].rotation.x = myPI * -0.5;
        // noiseFields[i].castShadow = true;
        noiseFields[i].receiveShadow = true;
        sceneBG.add( noiseFields[i] );
      }
      noiseFields[0].position.set( 0, 0, 0 );
      noiseFields[1].position.set( 0, 0, -256 );


      // var controls = new THREE.OrbitControls(cameraBG, rendererT.domElement);
      // controls.rotateSpeed = 1; //回転させるときの速さ
      // controls.zoomSpeed = 1.2; //ズームするときの速さ
      // controls.panSpeed = 2; //パンするときの速さ


      var trees = [];

      function moveTrees() {
        for (var i = 0, j = trees.length; i < j; i++) {
          if (trees[i].position.z < 128) {
            trees[i].position.z += moveSpeed;
          } else {
            trees[i].erase = true;
          }
        }
      }

      function eraseTrees() {
        for (var i = trees.length - 1, j = 0; i >= j; i--) {
          if (trees[i].erase === true) {
            sceneBG.remove( trees[i] );
            trees.splice(i, 1);
            // console.log('eraseTrees');
          }
        }
      }

      function addTrees(objName, pos) {
        // console.log('addTrees', objName, pos);
        var myTree = threeObj[objName].clone();
        myTree.erase = false;
        myTree.position.x = pos[0];
        myTree.position.y = pos[1];
        myTree.position.z = pos[2];
        myTree.rotation.y = toRadian(myFloor(myRandom() * 360));
        myTree.scale.set(0.2, 0.2, 0.2);
        myTree.castShadow = true;
        myTree.receiveShadow = true;
        // trees.push(myTree);
        trees[trees.length] = myTree;
        sceneBG.add(myTree);
      }


      // shadowControls
      var sampleSquare = function() {
        this.x = 0;
        this.y = 600;
        this.z = 0;
        // this.shadowCameraLeft = -60;
        // this.shadowCameraTop = -60;
        // this.shadowCameraRight = 60;
        // this.shadowCameraBottom = 60;
        this.shadowCameraNear = 20;
        this.shadowCameraFar = 412;
        this.shadowBias = -0.0001;
        this.shadowMapSize = 2048;
      };
      function setValToDat() {
        directionalLight.position.set( square.x, square.y, square.z );
        // directionalLight.shadow.camera.left = square.shadowCameraLeft;
        // directionalLight.shadow.camera.top = square.shadowCameraTop;
        // directionalLight.shadow.camera.right = square.shadowCameraRight;
        // directionalLight.shadow.camera.bottom = square.shadowCameraBottom;
        directionalLight.shadow.camera.near = square.shadowCameraNear;
        directionalLight.shadow.camera.far = square.shadowCameraFar;
        directionalLight.shadow.bias = square.shadowBias;
        directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = square.shadowMapSize;
      }
      /*
      var square = new sampleSquare();
      var gui = new dat.GUI();
      console.log('gui.add');
      gui.add(square, 'x').onChange(setValToDat);
      gui.add(square, 'y').onChange(setValToDat);
      gui.add(square, 'z').onChange(setValToDat);
      // gui.add(square, 'shadowCameraLeft').onChange(setValToDat);
      // gui.add(square, 'shadowCameraTop').onChange(setValToDat);
      // gui.add(square, 'shadowCameraRight').onChange(setValToDat);
      // gui.add(square, 'shadowCameraBottom').onChange(setValToDat);
      gui.add(square, 'shadowCameraNear').onChange(setValToDat);
      gui.add(square, 'shadowCameraFar').onChange(setValToDat);
      gui.add(square, 'shadowBias').onChange(setValToDat);
      gui.add(square, 'shadowMapSize').onChange(setValToDat);
      // /shadowControls
      */


      // Render Loop
      var renderLoop = function () {
        // if (frameCnt % 2 === 0) {
          for (var i = 0, j = noiseFields.length; i < j; i++) {
            if (noiseFields[i].position.z < 128) {
              noiseFields[i].position.z += moveSpeed;
            } else {
              noiseFields[i].position.z -= (512 - moveSpeed);
            }
          }

          moveTrees();

          eraseTrees();

          if (frameCnt % 60 === 0 && myRandom() < 0.7) {
            var newTreeName = (myRandom() < 0.5) ? 'dead_trees_0' : 'dead_trees_1';
            // var newTreeX = myFloor(myRandom() * 81) + 48;
            // if (myRandom() < 0.5) newTreeX *= -1;
            var newTreeX = myFloor(myRandom() * 91) + 8;
            newTreeX *= -1;
            addTrees(newTreeName, [newTreeX, 0, -312]);
          }

          rendererT.clearDepth();
          rendererT.render(sceneBG, cameraBG);

          cube.rotation.x += 0.03;
          cube.rotation.y += 0.03;
          cube.position.x = player.x;
          cube.position.y = STAGE_HEIGHT - player.y;
          materialPlayer.opacity = (!player.isInvincible) ? 1 : 0.3 + myFloor(frameCnt % 8 * 0.25) * 0.5;
          rendererT.render(scenePlayer, cameraPlayer);

          // controls.update();
        // }

        if (player.life !== 0 && isEnd === false) {
          requestAnimationFrame( renderLoop );
        }
      };

      renderLoop();
    }
  }
}
