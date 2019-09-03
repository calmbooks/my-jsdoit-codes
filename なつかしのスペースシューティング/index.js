// forked from calmbooks's "コーディングコンテスト Q vol.3 エントリー用コード" http://jsdo.it/calmbooks/QsampleGame
(function() {

    var win = window;
    var doc = document;

    var $win = $(win);
    var $doc = $(doc);

    var $container = $("#container");
    var $missile = $("#missile");
    var $earth = $("#earth");
    var $lifeList = $("#lifeList");
    var $light = $("#light");
    var $blockScoreWrap = $("#blockScoreWrap");
    var $score = $("#score");
    var $btnTweet = $("#btnTweet");

    var data = {

        life : 4,
        score : 0,
        ufoAppendInterval : 3000,

        missile : {

            x : 0,
            moveX : 0,
            width : $missile.width()
        },

        cannonball : {
            width : 24, 
            height: 12,
            length : 0,
            number : 0
        },

        ufo : {
            width : 100,
            height: 80,
            length : 0,
            number : 0,
            timer : 0
        }
    };

    var cannonball = {};
    var ufo = {};

    function missileControll() {

        data.missile.x = (data.window_width - data.missile.width) / 2;
        $missile.css("left", data.missile.x + "px");


        win.addEventListener("leftbuttondown", function() {

            data.missile.moveX = -2;

        }, false);

        win.addEventListener("rightbuttondown", function() {

            data.missile.moveX = 2;

        }, false);

        win.addEventListener("movebuttonup", function() {

            data.missile.moveX = 0;

        }, false);

        setInterval(function() {

            data.missile.x = data.missile.x + data.missile.moveX;

            var x = data.missile.x; 
            var n1 = data.window_width - data.missile.width;

            x = x > n1 ? n1 : x ;
            x = x < 0 ? 0 : x;

            $missile.css("left", x + "px");

        }, 10);
    }

    function cannonballControll() {

        win.addEventListener("Abuttonup", function() {

            var el = $('<div/>');

            data.cannonball.number += 1;
            data.cannonball.length += 1;

            var num = data.cannonball.number;

            cannonball["num" + num] = {};
            cannonball["num" + num].y = 50;
            cannonball["num" + num].x = data.missile.x + 36;

            el
                .addClass("cannonball")
                .appendTo($container)
                .css({

                    "left" : cannonball["num" + num].x
                })
            .end();


            cannonball["num" + num].timer = setInterval(function() {

                cannonball["num" + num].y += 9;
                el.css("bottom", cannonball["num" + num].y);

                if(cannonball["num" + num].y >= data.window_height) {

                    clearInterval(cannonball["num" + num].timer);
                    data.cannonball.length -= 1;
                    el.remove();
                    delete cannonball["num" + num];
                } 

            }, 30);

        }, false);

    }

    function ufoControll() {

        (function append() {

            var el = $('<div/>');
            var leftNum = Math.random() * data.window_width - data.ufo.width;
            leftNum = leftNum < 0 ? 0 : leftNum;

            data.ufo.length += 1;
            data.ufo.number += 1;

            var num = data.ufo.number;

            el
                .addClass("targetUFO targetUFO" + num)
                .appendTo($container)
                .css({ 

                    "bottom" : data.window_height,
                    "left" : leftNum

                })
            .end();

            ufo["num" + num] = {};
            ufo["num" + num].y = data.window_height;
            ufo["num" + num].x = leftNum;

            ufo["num" + num].timer = setInterval(function() {

                ufo["num" + num].y -= 3;

                el.css("bottom", ufo["num" + num].y);

            }, 30);

            data.ufo.timer = setTimeout(append, data.ufoAppendInterval); 

        }());
    }

    function hitJudge() {
        
        for(var key in cannonball) {


            var value = cannonball[key];
            var leftX = value.x;
            var rightX = value.x + data.cannonball.width;
            var topY = value.y + data.cannonball.height;
            var bottomY = value.y;

            for(var key in ufo) {

                var value = ufo[key];
                var ufoleftX = value.x;
                var uforightX = value.x + data.ufo.width;
                var ufotopY = value.y + data.ufo.height; 
                var ufobottomY = value.y;


                if((ufoleftX < leftX) && (uforightX > rightX) && (ufotopY > topY) && (ufobottomY < bottomY)) {

                    var num = key.replace("num", "");
                    
                    clearInterval(ufo[key].timer);
                    data.ufo.length -= 1;

                    $(".targetUFO" + num)
                        .addClass("bom")
                        .fadeOut(800)
                    .end();

                    delete ufo[key];

                    data.score += 1;

                    var interval = data.ufoAppendInterval * 0.9;
                    interval = interval < 300 ? 300 : interval;

                    data.ufoAppendInterval = interval;
                }
            }
        }

        for(var key in ufo) {

            if(ufo[key].y < 40) {

                var num = key.replace("num", "");

                clearInterval(ufo[key].timer);
                data.ufo.length -= 1;
                $(".targetUFO" + num).remove();
                delete ufo[key];

                earthDamage();

            }
        } 

    }

    function earthDamage() {

        var i = 0;

        var activeTimer = setInterval(function() { 

            $earth.toggleClass("active");
            i += 1;

            if(i > 3) {

                clearInterval(activeTimer);
                data.life -= 1;
                $lifeList.find(".active").filter(":last").removeClass("active");

                if(data.life <= 0) {

                    gameover();
                }
            }
        }, 200);
    }

    function gameover() {

        for(var key in ufo) {

            var num = key.replace("num", "");
            clearInterval(ufo[key].timer);
            $(".targetUFO" + num).remove();
        }

        $earth.remove();
        $missile.remove();
        clearTimeout(data.ufo.timer);

        $score.html(data.score);
        $light.show().fadeOut(3000, function() {

            $blockScoreWrap.show();

            var url = $btnTweet.find("a").attr("href");
            var text = url + "サンプルゲームでスコアは" + data.score + "でした！「ハマるブラウザゲームをつくろう」";

            $btnTweet.find("a").attr("href", encodeURI(text)); 
        });
    }

    function initialize() {
         
        setInterval(hitJudge, 10);

        $win.resize(function resizing() {
            data.window_width = $win.width();
            data.window_height = $win.height();
            data.window_widthHalf = data.window_width / 2;
            data.window_heightHalf = data.window_height / 2;

            return resizing;
        }());

        missileControll();
        ufoControll();
        cannonballControll();

    };

    jsdoitController.initialize({

        callback : initialize
    });

}());
