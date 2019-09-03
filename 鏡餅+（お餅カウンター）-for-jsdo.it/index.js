(function(win, doc, $) {

    var isTouch = ("ontouchstart" in win) ? true : false;

    /*
     * Element
     */	
	var el = {

		body : "body",
		container : "#container",
		blockOmochi : "#blockOmochi",
		blockBtnAdd : "#blockBtnAdd",
		btnAdd : "#btnAdd",
		countNumWrap : "#blockCountNumber .num"

	};

    /*
     * EventName
     */
	var eventName = {

		touchStart : isTouch ? "touchstart" : "mousedown",
		touchMove : isTouch ? "touchmove" : "mousemove",
		touchEnd : isTouch ? "touchend" : "mouseup"
	}; 

    /*
     * Data
     */
	var data = {

		countNum : 0
	};

    /*
     * Flag
     */	
	var flag = {
		
		animation : false,
		longOmochiLayout : false
	};

    /*
     * VendorPrefix
     */	
    var vendorPrefix = (function() {

        var str;

        if($.browser.webkit) {

            str =  "webkit";

        } else if($.browser.mozilla) {

            str = "moz";

        } else if($.browser.msie) {

            str = "ms";
        }

        return str;

    }());
	

    /*
     * Method
     */		
	var method = {

		cssAnimate : function(args) {

			var crStyle = args.element.style.cssText;
			var animStyle = "display: block; -" + vendorPrefix + "-animation: '" + args.type + "' " + args.time + "ms " + args.easing + ";";

			args.element.style.cssText = crStyle + "; " + animStyle;

			if(!args.time) {

				return;
			}

			setTimeout(function() {

				if(args.type.match(/fadeOut|popOut/g)) {

					args.element.style.display = "none";
				}

				if(args.callback) {

					args.callback();
				}

			}, args.time);
		},

		pipe : function(array) {

			(function next() {

				var arg = array.shift();
				var evt = { next : next };

				if(typeof arg == "function") {

					arg(evt);

				} else if(typeof arg == "number") {

					setTimeout(next, arg);
				}

			}()); 
		},
	
		layoutSet : function() {

			el.container.style.height = "1000px";

			win.scrollTo(0,0);

			var win_innerHeight =  win.innerHeight;


			if((win_innerHeight) > $("#blockOmochi").outerHeight()) {

				el.blockOmochi.className += " scriptStyle_minOmochi";
				el.container.style.height = win_innerHeight + "px";
				el.body.style.height = win_innerHeight + "px";


			} else {

				flag.longOmochiLayout = true;

				el.container.style.height = "auto";
				el.body.style.height = "auto";				
			}

			el.blockOmochi.style.opacity = 1;
		},

		layoutChange : function() {

				if(flag.longOmochiLayout) {

					return;
				}

				var win_innerHeight =  win.innerHeight;

				if((win_innerHeight) - 40 > $("#blockOmochi").outerHeight()) {

					return;
				}

				flag.longOmochiLayout = true;
	
				var paddingTop = $("#content").height() - $("#blockOmochi").outerHeight() + 150;

				el.blockOmochi.className = el.blockOmochi.className.replace(/scriptStyle_minOmochi/g, "");
				el.blockOmochi.style.paddingTop = paddingTop + "px";

				el.container.style.height = "auto";
				el.body.style.height = "auto";

		},

		mochiCount : function() {

			var mochiWrap = $("#blockOmochi .mochiWrap");

			el.btnAdd.addEventListener(eventName.touchEnd, function() {

				if(flag.animation) {
					
					return;
				}

				flag.animation = true;
				data.countNum += 1;

				var $newMochi = $("<div />")
				var crFirst = el.blockOmochi.querySelector(".mochi.first"); 
				var crSecond = el.blockOmochi.querySelector(".mochi.second"); 

				$newMochi
					.addClass("mochi first")
					.css("z-index", data.countNum)
					.prependTo(mochiWrap);

				if(data.countNum % 10 == 0) { //10個ごとに桜餅

					$newMochi.addClass("sakura");
				}

				el.blockBtnAdd.className += " scriptStyle_omochiWait";

				method.cssAnimate({

					type : "omochiIn",
					element : $newMochi[0],
					time : 1000,
					easing : "ease-in", 
					callback : function() {

						el.countNumWrap.innerHTML = data.countNum;

						localStorage.setItem("omochiNum", data.countNum);
					} 
				});

				method.pipe([

					700,

					function(e) {

						method.cssAnimate({

							type : "btnAddJump",
							element : el.blockBtnAdd,
							time : 500,
							easing : "ease-in-out", 
							callback : function() {

								el.blockBtnAdd.style.cssText = "";

								flag.animation = false;
								method.layoutChange();
							} 
						});

						el.blockBtnAdd.className = el.blockBtnAdd.className.replace(/scriptStyle_omochiWait/g, "");

						e.next();
					},

					250,

					function(e) {

						if(crFirst) {

							crFirst.className = crFirst.className.replace("first", "second");
						}

						if(crSecond) {

							crSecond.className = crSecond.className.replace("second", "");
						} 
					}

				]);

			}, false);

		},

		cookieOmochi : function() {

			var mochiWrap = $("#blockOmochi .mochiWrap");

			for(var i = 0, max = data.countNum; i < max; ++i) {

				(function(count) {

					var $newMochi = $("<div />");

					$newMochi
						.addClass("mochi")
						.css("z-index", max - count)
						.appendTo(mochiWrap);

					if(count == 0) {

						$newMochi.addClass("first");

					} else if(count == 1) {

						$newMochi.addClass("second");
					}

					if((max - count) % 10 == 0) { //10個ごとに桜餅

						$newMochi.addClass("sakura");
					}
					

				}(i));
			}
		},

		elementGet : function() {

			for(var key in el) {

				el[key] = doc.querySelector(el[key]);
			}
		},

		initialize : function() {

			method.elementGet();

			var omochiNum = localStorage.getItem("omochiNum") - 0; 

			if(omochiNum) {

				data.countNum = omochiNum;
				el.countNumWrap.innerHTML = data.countNum;

				method.cookieOmochi();
			}

			method.mochiCount();

			win.addEventListener("load", function() {

				method.layoutSet(); 

			}, false);
		}
	};

	$(doc).ready(method.initialize);

}(window, document, $));
