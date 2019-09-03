(function(win, doc) {

    var isTouch = ('ontouchstart' in win) ? true : false,
        START = isTouch ? 'touchstart' : 'mousedown',
        MOVE = isTouch ? 'touchmove' : 'mousemove',
        END = isTouch ? 'touchend' : 'mouseup';

    var vendorPrefix = (function() {

        var prefix = "";

        if($.browser.webkit) {

            prefix =  "-webkit-";

        } else if($.browser.mozilla) {

            prefix = "-moz-"; 

        } else if($.browser.msie) {

            prefix = "-ms-";
        }

        return prefix;

    }()); 
    
    var smphController = {

        elements : {

            stick : $("#stick"),
            stickArea : $("#stickArea")

        },

        data : {

            stickDeg : 0,
            stickPower: 0,

            dragData : {
                fromX : false,
                fromY : false,
                boxX : 0,
                boxY : 0
            }
        },

        stickEvt : function() {

            el.stick[0].addEventListener(START, touchStart, false);
            el.stick[0].addEventListener(END, touchEnd, false);

            var touchesNum, throttle = 0;
            
            function touchStart(event) {

                if(isTouch) {
                    touchesNum = event.touches.length - 1;
                }

                $(this).addClass("touched"); 

                el.stick[0].removeEventListener(START, moveSet, false);
                el.stick[0].addEventListener(MOVE, moveSet, false);
            }

            function touchEnd() {

                $(this).removeClass("touched"); 

                el.stick[0].removeEventListener(MOVE, moveSet, false);

                data.stickDeg = 0; 
                data.stickPower = 0;

                if(vendorPrefix == "-webkit-") {
                    el.stick
                        .css({

                            "-webkit-transform"  : "translate3d(0,0,0)",
                            "-webkit-transition" : "-webkit-transform 0.1s ease-out"

                        })
                        .one("webkitTransitionEnd", function() {

                            $(this).attr("style", "");

                            el.stick[0].addEventListener(START, touchStart, false);
                            
                        })
                    .end();

                } else if(vendorPrefix == "-moz-") {
                    el.stick 
                        .css({

                            "-moz-transform"  : "translate3d(0,0,0)",
                            "-moz-transition" : "-moz-transform 0.1s ease-out"

                        })
                        .one("mozTransitionEnd", function() {

                            $(this).attr("style", "");

                            el.stick[0].addEventListener(START, touchStart, false);
                            
                        })
                    .end();
                } 
            }

            function moveSet(event) {

                event.preventDefault();
                move(event);
            }

            var dragData = data.dragData;

            function move(event) {

                if(throttle != 1) {
                    throttle += 1;
                    return;
                }

                throttle = 0;

                var fromX = dragData.fromX,
                    fromY = dragData.fromY,
                    boxX  = dragData.boxX,
                    boxY  = dragData.boxY,
                    moveX = 0,
                    moveY = 0,
                    boxTranslate = 0;

                if(isTouch) {

                    var currentTouchesNum = event.touches.length - 1;

                    if(touchesNum > currentTouchesNum) {

                        touchesNum -= (touchesNum - currentTouchesNum);
                        
                    }

                    var pageX = event.touches[touchesNum].pageX | 0,
                        pageY = event.touches[touchesNum].pageY | 0;

                } else {

                    var pageX = event.pageX | 0,
                        pageY = event.pageY | 0;
                }

                if(fromX && fromY) { 
                    moveX = pageX - fromX;
                    moveY = pageY - fromY;
                }

                boxX = dragData.boxX + moveX;
                boxY = dragData.boxY + moveY;

                boxTranslate = Math.sqrt((boxX * boxX) + (boxY * boxY)) * (-1);
                boxTranslate = ((boxTranslate * 1000)  | 0) * 0.001;
                dragData.boxTranslate = (boxTranslate < -60) ? -60 : boxTranslate;

                var deg = Math.atan(boxX / boxY) / (3.14 / 180) | 0;

                if(boxY < 0) {

                    if(boxX > 0) {

                        dragData.boxDeg = deg * (-1);

                    } else {

                        dragData.boxDeg = deg * (-1) + 360; 
                    }

                } else {

                    if(boxX > 0) {

                        dragData.boxDeg = deg * (-1) + 180;

                    } else {

                        dragData.boxDeg = deg * (-1) + 180;
                    }
                }

                dragData.boxX = boxX;
                dragData.boxY = boxY;
                dragData.fromX = pageX;
                dragData.fromY = pageY;

                rendar();
            }

            function rendar() {

                el.stick.css(vendorPrefix + "transform", "rotate(" + dragData.boxDeg + "deg) translate3d(0," + dragData.boxTranslate + "px,0)");

                var power = (dragData.boxTranslate / 60) * 100 | 0;
                power = (power < 0) ? power * (-1) : power ;

                data.stickDeg = dragData.boxDeg; 
                data.stickPower = power;

            }

        }
    };

    var self = smphController,
        el = self.elements,
        data = self.data;

    win.addEventListener("load", smphController.stickEvt, false);

}(window, document));
