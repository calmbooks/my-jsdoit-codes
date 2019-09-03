var charaAnimation = function() {
	var chara = $("#chara");
	var chgTimer;
	var frame1 = function() {
		removeCngClass();
		chara.addClass("chg4");
		chgTimer = setTimeout(frame2, 300);
	}
	var frame2 = function() {
		removeCngClass();
		chara.addClass("chg3");
		chgTimer = setTimeout(frame3, 300);
	}
	var frame3 = function() {
		removeCngClass();
		chara.addClass("chg4");
		chgTimer = setTimeout(frame4, 300);
	}
	var frame4 = function() {
		removeCngClass();
		chara.addClass("chg3");
		chgTimer = setTimeout(frame5, 300);
	}
	var frame5 = function() {
		removeCngClass();
		chara.addClass("chg4");
		chgTimer = setTimeout(frame6, 300);
	}
	var frame6 = function() {
		removeCngClass();
		chara.addClass("chg3");
		chgTimer = setTimeout(frame7, 300);
	}
	var frame7 = function() {
		removeCngClass();
		chara.addClass("chg4");
		chgTimer = setTimeout(frame8, 300);
	}
	var frame8 = function() {
		removeCngClass();
		chara.addClass("chg2");
		chgTimer = setTimeout(frame9, 300);
	}
	var frame9 = function() {
		removeCngClass();
		chara.addClass("chg1");
		chgTimer = setTimeout(frame10, 300);
	}
	var frame10 = function() {
		removeCngClass();
		chara.addClass("chg2");
		chgTimer = setTimeout(frame1, 300);
	} 
	var removeCngClass = function() {
		chara.removeClass("chg1").removeClass("chg2").removeClass("chg3").removeClass("chg4");
	}
	frame1();
}
$(function () { 	
	charaAnimation();
});
