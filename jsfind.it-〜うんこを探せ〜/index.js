var glass = {}; //名前空間定義
glass.variable = {};

$(window).load(function () {
	var element = glass.elementSet();
	element.loader.fadeOut("slow"); 
	glass.glassSet(element);
}); 
glass.elementSet = function() {
	return {
		container: $("#container"),
		loader: $("#loader"),
		glass: $("#glass"),

		meter01: $(".meter01"),
		meter02: $(".meter02"),
		meter03: $(".meter03"),
		meter04: $(".meter04")
	}
}	
glass.glassSet = function(element) {

	glass.variable.ratioX = 720 / element.container.outerWidth();
	glass.variable.ratioY = 650 / element.container.outerHeight();

	glass.variable.glassX = element.glass.position().left;
	glass.variable.glassY = element.glass.position().top;

	glass.glassBgSet(element, glass.variable);
	
    	element.glass.mousedown(function () {

		glass.variable.crX = false;
		glass.variable.crY = false;

		element.container.bind("mousemove", function(event) { 
			glass.glassHave(event, element, glass.variable);
		});
	});
    	$("body").mouseup(function () {
		element.container.unbind("mousemove");
	});
}
glass.glassHave = function(event, element, v) {
	
	element.meter01.text(v.ratioX);
	element.meter02.text(v.ratioY);
    
	if(v.crX) { v.moveX = event.pageX - v.crX; } else { v.moveX = 0; }
	if(v.crY) { v.moveY = event.pageY - v.crY; } else { v.moveY = 0; }

	v.glassX = v.glassX + v.moveX;
	v.glassY = v.glassY + v.moveY;

	element.glass.css({ left: v.glassX, top: v.glassY });

	glass.glassBgSet(element, v);

	v.crX = event.pageX;
	v.crY = event.pageY;
}
glass.glassBgSet = function(element, v) {

	v.glassBgX = v.glassX * v.ratioX * (-1);
	v.glassBgY = v.glassY * v.ratioY * (-1);
    
	element.meter03.text(v.glassBgX);
	element.meter04.text(v.glassBgY);

	element.glass.css({ backgroundPosition: v.glassBgX + "px " + v.glassBgY + "px" });
}




