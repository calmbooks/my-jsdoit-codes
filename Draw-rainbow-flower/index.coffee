do ( win = window, doc = document ) =>

	cvs = doc.getElementById "c"
	ctx = cvs.getContext "2d"

	cvs.width  = cvs_W = win.innerWidth
	cvs.height = cvs_H = win.innerHeight

	cvs_W_half = cvs_W * 0.5
	cvs_H_half = cvs_H * 0.5

	FPS      = 60
	SPEED    = 0.005 # ratio/ms
	ROTATE   = 0.06
	INCREASE = 0.01

	class Main

		constructor : () ->

			@init()

		init : () =>

			@distance = Math.min( cvs_W, cvs_H ) * 0.5 - 10
			@radius   = @distance * 0.2

			@distance_max = @distance * 1.5

			@ratio     = 0
			@side      = 0
			@direction = 0

			@color_hsv = { h : 0, s : 150, v : 255 }

			@last = new Point 0, 0

			@center = new Point cvs_W * 0.5, cvs_H * 0.5

			ctx.translate @center.x, @center.y

			@set_points @side, @direction

			@setup_update()


		set_points : ( side, direction ) =>

			d = @distance * -1

			@start = if side is 0 then new Point 0, 0 else new Point 0, d

			@control = if side is direction then new Point @radius * -1, d else new Point @radius, @distance * -1

			@target = if side is 0 then new Point 0, d else new Point 0, 0


		setup_update : () =>

			@timeoutID = null
			@last_time = Date.now()

			@update()


		update : () =>

			return if @timeoutID isnt null

			now_time = Date.now()

			delta = now_time - @last_time

			@setup_draw delta

			@timeoutID = setTimeout =>

				@timeoutID = null

				@update()

			, 1000 / FPS

			@last_time = now_time

		setup_draw : ( d ) =>

			next_ratio = @ratio + ( d * SPEED )

			next_ratio = 1 if next_ratio > 1

			while @ratio < next_ratio

				@ratio += INCREASE

				next = @get_point_quadratic @ratio

				@color_hsv.h += INCREASE

				@color_hsv.h = 0 if @color_hsv.h > 360

				rgb = @get_hsv_to_rgb @color_hsv

				width = if @side is 0 then @ratio * 10 else ( 1 - @ratio ) * 10

				@draw @last, next, "rgb(#{rgb.r},#{rgb.g},#{rgb.b})", width

				@last = next

			@reset() if @ratio >= 1

		reset : () =>

			if @side is 0

				@side = 1

			else
			
				ctx.rotate Math.PI + ROTATE

				@direction = if @direction is 0 then 1 else 0

				@side = 0

				@distance -= 1

				@radius = @distance * 0.2

				@distance = @distance_max if Math.abs( @distance ) > @distance_max

			@set_points @side, @direction

			@ratio = 0


		get_point_quadratic : ( t ) =>

			tp = 1 - t

			x = ( t * t * @target.x ) + ( 2 * t * tp * @control.x ) + ( tp * tp * @start.x )
			y = ( t * t * @target.y ) + ( 2 * t * tp * @control.y ) + ( tp * tp * @start.y )

			return new Point x, y

		get_hsv_to_rgb : ( hsv ) =>

			h = hsv.h
			s = hsv.s
			v = hsv.v

			i = Math.floor( h / 60 ) % 6
			f = ( h / 60 ) - Math.floor( h / 60 )
			p = Math.round v * ( 1 - ( s / 255 ) )
			q = Math.round v * ( 1 - ( s / 255 ) * f )
			t = Math.round v * ( 1 - ( s / 255 ) * ( 1 - f ))

			switch i

				when 0 then rgb = { r : v, g : t, b : p }
				when 1 then rgb = { r : q, g : v, b : p }
				when 2 then rgb = { r : p, g : v, b : t }
				when 3 then rgb = { r : p, g : q, b : v }
				when 4 then rgb = { r : t, g : p, b : v }
				when 5 then rgb = { r : v, g : p, b : q }

			return rgb



		draw : ( last, next, color, width ) =>

			ctx.strokeStyle = color
			ctx.lineWidth   = width
			ctx.lineCap     = "round"

			ctx.beginPath()
			ctx.moveTo last.x, last.y
			ctx.lineTo next.x, next.y

			ctx.stroke()

	class Point

		constructor : ( x, y ) ->

			@x = x
			@y = y



	win.addEventListener "load", =>

		new Main()

	, false
