(function(win, doc) {

	var canvas = document.getElementById("area");
	var circles = canvas.getContext("2d");

	var prm = {

		quantity : 50,

		radius : [30, 50],
		speed : [-10, -2, 2, 10],

		color_R : [0, 255],
		color_G : [0, 255],
		color_B : [0, 255],

		opacity : 0.8
	};

	var data = {

		stage_width : win.innerWidth,
		stage_height : win.innerHeight
	};

	function moving() {

		circles.clearRect(0, 0, data.stage_width, data.stage_height);
	
		for(var i = 1, max = prm.quantity; i <= max; ++i) {

			var cir = data["circle_" + i];

			cir.position_X += cir.move_X;
			cir.position_Y += cir.move_Y;

			if(cir.bound_max_X < cir.position_X) {

				cir.move_X *= -1;
				cir.position_X = cir.bound_max_X;
			}

			if(cir.position_X < cir.bound_min_X) {

				cir.move_X *= -1;
				cir.position_X = cir.bound_min_X;
			}

			if(cir.bound_max_Y < cir.position_Y) {

				cir.move_Y *= -1;
				cir.position_Y = cir.bound_max_Y;
			}

			if(cir.position_Y < cir.bound_min_Y) {

				cir.move_Y *= -1;
				cir.position_Y = cir.bound_min_Y;
			}

			circles.beginPath();
			circles.arc(cir.position_X, cir.position_Y, cir.radius, 0, 10, false);
			circles.fillStyle = cir.fill_color;
			circles.fill();
		}

		setTimeout(moving, 10);
	}

	function make() {

		function ranNum(array) {

			if(array.length == 2) {

				var num1 = array[0];
				var num2 = array[1];

				return Math.random() * (num2 - num1) + num1 | 0;
			}

			if(array.length == 4) {

				var flag = Math.random() < 0.5 ? true : false;

				var num1 = flag ? array[0] : array[2];
				var num2 = flag ? array[1] : array[3];

				return Math.random() * (num2 - num1) + num1 | 0;
			}
		}

		for(var i = 1, max = prm.quantity; i <= max; ++i) {

			data["circle_" + i] = {

				fill_color : "rgba(" + ranNum(prm.color_R) + "," + ranNum(prm.color_G) + "," + ranNum(prm.color_B) + "," + prm.opacity + ")",
				radius : ranNum(prm.radius),

				position_X : data.stage_width / 2,
				position_Y : data.stage_height / 2,

				move_X : ranNum(prm.speed),
				move_Y : ranNum(prm.speed)
			};
		}
	}

	function canvas_resize() {

		var width = win.innerWidth;
		var height = win.innerHeight;

		canvas.setAttribute("width", width);
		canvas.setAttribute("height", height);

		data.stage_width = width;
		data.stage_height = height;

		for(var i = 1, max = prm.quantity; i <= max; ++i) {

			var cir = data["circle_" + i];

			cir.bound_min_X = cir.radius;
			cir.bound_max_X = data.stage_width - cir.radius;

			cir.bound_min_Y = cir.radius; 
			cir.bound_max_Y = data.stage_height - cir.radius;
		}

		return canvas_resize;
	}

	function init() {

		make();
		moving();

		win.addEventListener("resize", canvas_resize() , false);
	};

	win.addEventListener("load", init, false); 

}(window, document));