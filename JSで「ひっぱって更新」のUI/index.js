(function(win, doc) {

    /*
     *
     * vendorPrefix
     *
     */
    var userAgent = navigator.userAgent.toLowerCase();

    var vendorPrefix = (function() {

        var prefix = "";

        if(userAgent.search("safari") > 0) {

            prefix =  "webkit";

        } else if(userAgent.search("firefox") > 0) {

            prefix = "moz";
        }

        return prefix;

    }());


    /*
     *
     * eventName
     *
     */
    var isTouch = ("ontouchstart" in win) ? true : false;
    var touchStartEvt = isTouch ? "touchstart" : "mousedown";
    var touchMoveEvt = isTouch ? "touchmove" : "mousemove";
    var touchEndEvt = isTouch ? "touchend" : "mouseup";
    var transitionEndEvt = vendorPrefix + "TransitionEnd";


    /*
     *
     * Element
     *
     */        
    var container = doc.querySelector("#container");
    var contentWrap = doc.querySelector("#contentWrap");
    var content = doc.querySelector("#content");
    var loader = doc.querySelector("#contentLoader");


    /*
     *
     * StylePropatyName
     *
     */
    var transform = vendorPrefix + "Transform";
    var transition = vendorPrefix + "Transition";


    /*
     *
     * Data
     *
     */
    var data = {

        fromY : false,
        moveY : 0,
        contentY : 0

    };


    /*
     *
     * Flag
     *
     */

    var flag = {

        releaseLoad : false

    };


    /*
     *
     * Method
     *
     */
    var method = {

        scrollEvt : function() {

            var releaseTimer = 0;

            content.addEventListener(touchStartEvt, start, false);
            content.addEventListener(touchEndEvt, end, false);

            function reset() {

                clearInterval(releaseTimer);
                data.fromY = false;
                content.style[transition] = "";
            }

            function start() {

                reset();

                content.removeEventListener(touchStartEvt, start, false);
                content.classList.add("transitionNone");

                content.addEventListener(touchMoveEvt, move, false);
            }

            function end() {

                content.classList.remove("transitionNone");
                content.removeEventListener(touchMoveEvt, move, false);
                content.addEventListener(touchStartEvt, start, false);

                if(flag.releaseLoad) {

                    fit({ targetY : 60 });
                    loader.className = "loading";

                    method.contentLoading({

                        callback : function() {

                            flag.releaseLoad = false;
                            loader.className = "pull";

                            if(data.contentY > 0) {

                                fit({ targetY : 0 });

                            }
                        }
                    });

                    return;
                }

                if(data.contentY > 0) {

                    fit({ targetY : 0 });

                } else if(data.contentY < data.maxY) {


                    fit({ targetY : data.maxY });

                } else {

                    release();
                }
            }

            function move(event) {

                var fromY = data.fromY;
                var pageY = isTouch ? event.touches[0].pageY | 0 : event.pageY | 0;
                var moveY = fromY ? pageY - fromY : 0;

                data.contentY = data.contentY + moveY;
                data.moveY = moveY;
                data.fromY = pageY;

                moveRendar();
            }

            function moveRendar() {

                var contentY =  (data.contentY * 10000 | 0) * 0.0001;
                var maxY = data.maxY;

                if(contentY > 0) {

                    contentY = contentY / 2;

                    if(contentY > 60) {

                        loader.className = "release";
                        flag.releaseLoad = true;

                    } else {

                        loader.className = "pull";
                        flag.releaseLoad = false;
                    }
                }

                if(contentY < maxY) {

                    contentY = ((contentY - maxY) / 2) + maxY;
                }

                content.style[transform] = "translate3d(0, " + contentY + "px, 0)";
            }

            function release() {

                releaseTimer = setInterval(function() {

                    var moveY = data.moveY * 0.95;
                    var contentY = data.contentY;

                    if(contentY > 0 || contentY < data.maxY) {

                        var targetY = contentY > 0 ? 0 : data.maxY;

                        moveY = moveY * 0.6;

                        if(moveY < 0.05 && moveY > -0.05) {

                            data.moveY = 0;
                            clearInterval(releaseTimer);
                            fit({ targetY : targetY });

                            return;
                        } 
                    }

                    if(moveY < 0.05 && moveY > -0.05) {

                        data.moveY = 0;
                        clearInterval(releaseTimer);

                        return;
                    }

                    data.contentY = contentY + moveY;
                    data.moveY = moveY;

                    releaseRendar();
                
                }, 10);

            }

            function releaseRendar() {

                var contentY =  (data.contentY * 10000 | 0) * 0.0001;

                content.style[transform] = "translate3d(0, " + contentY + "px, 0)";
            }

            function fit(args) {

                content.style[transition] = "0.3s ease-out";
                content.style[transform] = "translate3d(0, " + args.targetY + "px ,0)";

                data.contentY = args.targetY;
            }
        },

        contentLoading : function(args) {

            //ここに更新の処理を書く
            setTimeout(args.callback, 2000);

        },

        contentInitiarize : function() {

            var n1 = getComputedStyle(contentWrap, "").height.replace("px", "") - 0;
            var n2 = getComputedStyle(content, "").height.replace("px", "") - 0;

            data.maxY = n1 - n2;

        },

        fullScreenMode : function() {

            doc.addEventListener(touchStartEvt, function setting(event) {

                container.style.height = "1000px";

                win.scrollTo(0, 1);

                container.style.height = win.innerHeight + "px";

                method.contentInitiarize();

                return setting;

            }(), false);
        },

        documentStop : function() {

            doc.addEventListener(touchMoveEvt, function(event) {
                
                event.preventDefault();

            }, false);
        }
    };


    /*
     *
     * Initiarize
     *
     */
    function initiarize() {
            
        method.documentStop();
        method.fullScreenMode();
        method.scrollEvt(); 

    }

    win.addEventListener("load", initiarize, false);


}(window, document));
