do ( win = window, doc = document ) =>

	cvs = doc.getElementById "c"
	ctx = cvs.getContext "2d"

	cvs.width  = cvs_W = win.innerWidth
	cvs.height = cvs_H = win.innerHeight


	FPS         = 60
	POINT_NUM   = 15
	POINT_SPEED = 0.5 # 0.5 px/ms

	DEFAULT_RENDERER_TYPE = 0


	clamp = ( min, max ) =>

		return Math.random() * ( max - min ) + min


	central = ( p1, p2 ) =>

		return ( p2 - p1 ) * 0.5 + p1


	central2d = ( p1, p2 ) =>

		return {
			x : ( p2.x - p1.x ) * 0.5 + p1.x
			y : ( p2.y - p1.y ) * 0.5 + p1.y
		}


	class Main

		constructor : () ->

			@fuyos = [
				new Fuyo "rgba(255,0,0,0.3)"
				new Fuyo "rgba(0,255,0,0.3)"
				new Fuyo "rgba(0,0,255,0.3)"
			]

			@change_renderer DEFAULT_RENDERER_TYPE # Default renderer

			@set_click_event()

			@setup_update()


		set_click_event : () =>

			is_touch = if "ontouchstart" of win then true else false

			doc.addEventListener ( if is_touch then "touchmove" else "mousemove" ), ( event ) =>

				event.preventDefault()

			, false

			doc.addEventListener ( if is_touch then "touchend" else "click" ), ( event ) =>

				event.preventDefault()
				
				@change_renderer()

			,false


		change_renderer : ( type ) =>

			@renderer_type = if type? then type else @renderer_type + 1

			@renderer_type = 0 if @renderer_type > 5

			@clear()

			fuyo.set_renderer @renderer_type for fuyo in @fuyos

			@afterimage_mode = if @renderer_type is 0 then true else false

			if 0 < @renderer_type < 5

				@fuyos[1].set_visible false
				@fuyos[0].set_visible false

			else

				@fuyos[1].set_visible true
				@fuyos[0].set_visible true


		setup_update : () =>

			@timeoutID = null
			@last_time = Date.now()

			@update()


		update : () =>

			return if @timeoutID isnt null

			now_time = Date.now()

			delta = now_time - @last_time

			@clear()

			fuyo.update delta for fuyo in @fuyos

			@timeoutID = setTimeout =>

				@timeoutID = null

				@update()

			, 1000 / FPS

			@last_time = now_time


		clear : () =>

			if @afterimage_mode

				ctx.globalCompositeOperation = "source-over"

				ctx.fillStyle = "rgba(0,0,0,0.05)"
				ctx.fillRect 0, 0, cvs_W, cvs_H

			else
				ctx.clearRect 0, 0, cvs_W, cvs_H



	class Fuyo

		constructor : ( @color ) ->
			
			@points = new Array POINT_NUM

			for i in [ 0...@points.length ]

				@points[i] = new Point()

			@set_visible true


		update : ( d ) =>

			point.update d for point in @points

			@renderer() if @visible


		set_renderer : ( type ) =>

			@renderer = @["draw_type_#{type}"]


		set_visible : ( value ) =>

			@visible = value


		draw_type_0 : () =>

			ctx.globalCompositeOperation = "lighter"

			ctx.fillStyle = @color

			ctx.beginPath()

			for i in [0...( max = @points.length )]

				if i is 0

					first = central2d( @points[max - 1], @points[0] )

					ctx.moveTo first.x, first.y

				point = @points[i]

				next = central2d( point, @points[ if ( i + 1 ) < max then i + 1 else 0 ] )

				ctx.quadraticCurveTo point.x, point.y, next.x, next.y

			ctx.fill()


		draw_type_1 : () =>

			ctx.globalCompositeOperation = "source-over"

			ctx.fillStyle = "rgba(255,255,255,0.7)"

			for point in @points

				ctx.beginPath()
				ctx.arc( point.x, point.y, 5, 360, true )
				ctx.fill()


		draw_type_2 : () =>

			ctx.globalCompositeOperation = "source-over"

			ctx.fillStyle = "yellow"

			for i in [0...( max = @points.length )]

				ctx.beginPath()

				point = @points[i]

				central = central2d( point, @points[ if ( i + 1 ) < max then i + 1 else 0 ] )

				ctx.arc( central.x, central.y, 4, 360, false )

				ctx.fill()


			ctx.fillStyle = "rgba(255,255,255,0.5)"

			for point in @points

				ctx.beginPath()
				ctx.arc( point.x, point.y, 5, 360, true )
				ctx.fill()

			ctx.strokeStyle = "rgba(255,255,255,0.2)"

			ctx.beginPath()

			for i in [0...( max = @points.length )]

				point = @points[i]

				if i is 0 then ctx.moveTo point.x, point.y else ctx.lineTo point.x, point.y

			ctx.closePath()
			ctx.stroke()


		draw_type_3 : () =>

			ctx.globalCompositeOperation = "source-over"
			ctx.fillStyle                = "yellow"


			for i in [0...( max = @points.length )]

				ctx.beginPath()

				point = @points[i]

				central = central2d( point, @points[ if ( i + 1 ) < max then i + 1 else 0 ] )

				ctx.arc( central.x, central.y, 4, 360, false )

				ctx.fill()


			ctx.fillStyle = "rgba(255,255,255,0.5)"

			for point in @points

				ctx.beginPath()
				ctx.arc( point.x, point.y, 5, 360, true )
				ctx.fill()

			ctx.strokeStyle = "rgba(255,255,255,0.2)"

			ctx.beginPath()

			for i in [0...( max = @points.length )]

				point = @points[i]

				if i is 0 then ctx.moveTo point.x, point.y else ctx.lineTo point.x, point.y

			ctx.closePath()
			ctx.stroke()


			ctx.strokeStyle = "yellow"
			ctx.lineWidth   = 2

			ctx.beginPath()

			for i in [0...( max = @points.length )]

				if i is 0

					first = central2d( @points[max - 1], @points[0] )

					ctx.moveTo first.x, first.y

				point = @points[i]

				next = central2d( point, @points[ if ( i + 1 ) < max then i + 1 else 0 ] )

				ctx.quadraticCurveTo point.x, point.y, next.x, next.y

			ctx.stroke()


		draw_type_4 : () =>

			ctx.globalCompositeOperation = "source-over"

			ctx.fillStyle = @color

			ctx.beginPath()

			for i in [0...( max = @points.length )]

				if i is 0

					first = central2d( @points[max - 1], @points[0] )

					ctx.moveTo first.x, first.y

				point = @points[i]

				next = central2d( point, @points[ if ( i + 1 ) < max then i + 1 else 0 ] )

				ctx.quadraticCurveTo point.x, point.y, next.x, next.y

			ctx.fill()


		draw_type_5 : () =>

			@draw_type_0()


	class Point

		constructor : ( @x = cvs_W / 2, @y = cvs_H / 2 ) ->

			 @speed = POINT_SPEED
			 @angle = clamp 0, Math.PI * 2

			 @speed_X = Math.cos( @angle ) * @speed
			 @speed_Y = Math.sin( @angle ) * @speed


		update : ( d ) =>

			@x = x = @x + ( @speed_X * d )
			@y = y = @y + ( @speed_Y * d )

			@x *= -1 if x < 0
			@y *= -1 if y < 0

			@x = cvs_W - @x + cvs_W if cvs_W < x
			@y = cvs_H - @y + cvs_H if cvs_H < y

			@speed_X *= -1 if x < 0 or cvs_W < x
			@speed_Y *= -1 if y < 0 or cvs_H < y




	win.addEventListener "load", =>

		new Main()

	, false
