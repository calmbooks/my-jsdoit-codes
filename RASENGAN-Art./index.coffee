do ( win = window, doc = document ) =>

	Global = {}

	cvs = doc.getElementById "c"
	ctx = cvs.getContext "2d"

	cvs_l = Math.min win.innerWidth, win.innerHeight

	cvs.width  = cvs_l
	cvs.height = cvs_l

	cvs.style.margin = "-#{ cvs_l / 2 }px 0 0 -#{ cvs_l / 2 }px"

	FPS           = 60
	SPHERE_RADIUS = 1000
	DOTS_QUANTITY = 8
	LINE_QUANTITY = 50
	SKIN_QUANTITY = 4

	class Main

		constructor : () ->

			@init()

		init : () =>

			Global.renderer = renderer = new Renderer()
			Global.camera   = camera   = new Camera cvs_l, cvs_l

			Global.skin = Math.random() * SKIN_QUANTITY | 0

			renderer.set_camera camera

			@background = new Background()

			for i in [ 0...DOTS_QUANTITY ]

				dots = new Dots()

				renderer.add_object dots

			for i in [ 0...LINE_QUANTITY ]

				line = new Line ( if Math.random() > 0.7 then 1 else 0 )

				renderer.add_object line

			@set_click_event()

		change_skin : () =>

			Global.skin = if Global.skin is ( SKIN_QUANTITY - 1 ) then 0 else Global.skin + 1

			@background.change_color()

			object.change_color() for object in Global.renderer.objects

		set_click_event : () =>

			is_touch = if "ontouchstart" of win then true else false

			doc.addEventListener ( if is_touch then "touchmove" else "mousemove" ), ( event ) =>

				event.preventDefault()

			, false

			doc.addEventListener ( if is_touch then "touchend" else "click" ), ( event ) =>

				@change_skin()

			,false


	class Background

		COLOR : [

			"rgb(255,130,0)"
			"rgb(0,200,100)"
			"rgb(0,120,200)"
			"rgb(255,100,175)"
		]

		constructor : () ->

			@init()

		init : () =>

			@set_background_color()

		set_background_color : () =>

			@color = @COLOR[ Global.skin ]

			doc.body.style.background = @color

		change_color : () =>

			@set_background_color()


	class Object3D

		constructor : () ->

			@vertexes = new Array()

			@position = {

				x : 0
				y : 0
				z : 0
			}

			@scale = {

				x : 1
				y : 1
				z : 1
			}

			@rotate = {

				x : 0
				y : 0
				z : 0
			}


	class Particle extends Object3D

		value_init : () =>

			@color = @get_color_rgb()

			@a_speed = Utils.clamp Utils.dtr( @ANGLE_SPEED.min ), Utils.dtr( @ANGLE_SPEED.max )
			@h_speed = @a_speed * 50

			@radius = Utils.clamp SPHERE_RADIUS - 100, SPHERE_RADIUS + 100

			@position.y = Utils.clamp @radius * -1, @radius

			@angle = Utils.clamp 0, 2 * Math.PI

			@h_direction = if Math.random() > 0.5 then 1 else -1
			@a_direction = if Math.random() > 0.5 then 1 else -1

		set_position : () =>

			sr = @radius
			y  = @position.y
			a  = @angle

			r = Math.sqrt ( sr * sr ) - ( y * y )

			x = r * Math.cos( a )
			z = r * Math.sin( a )

			@position.x = x
			@position.z = z

		get_color_rgb : () =>

			if Global.skin is 0

				return {
					r : Utils.clamp( 200, 255 ) | 0
					g : Utils.clamp(   0, 255 ) | 0
					b : Utils.clamp(   0, 255 ) | 0
				}

			else if Global.skin is 1

				return {
					r : Utils.clamp(   0, 255 ) | 0
					g : Utils.clamp( 200, 255 ) | 0
					b : Utils.clamp(   0, 255 ) | 0
				}

			else if Global.skin is 2

				return {
					r : Utils.clamp(   0, 255 ) | 0
					g : Utils.clamp(   0, 255 ) | 0
					b : Utils.clamp( 200, 255 ) | 0
				}

			else if Global.skin is 3

				return {
					r : Utils.clamp( 150, 255 ) | 0
					g : Utils.clamp( 150, 255 ) | 0
					b : Utils.clamp( 150, 255 ) | 0
				}

		update : ( d ) =>

			a_val = @a_speed * d
			h_val = @h_speed * d

			target_angle = @angle + ( a_val * @a_direction )
			target_y     = @position.y + ( @h_direction * h_val )

			i = @angle
			t = @angle + a_val

			while i < t

				@angle += ( @ANGLE_DISTANCE * @a_direction )

				y = @position.y + ( @h_direction * @HEIGHT_DISTANCE )

				if Math.abs( @angle ) > t

					@angle = target_angle
					y = target_y

				if y > @radius

					y = @radius

					@h_direction = -1

					@angle += Math.PI

				if y < @radius * -1

					y = @radius * -1

					@h_direction = 1

					@angle += Math.PI

				@position.y = y

				@rotate.y = @angle + ( Math.PI / 2 ) # Object自身の回転

				@set_position()

				@archives.unshift @get_archive()

				if @archives.length > @AFTER_NUM

					@archives = @archives.slice 0, @AFTER_NUM

				i += @ANGLE_DISTANCE

			@render() if @archives.length >= 2

		get_archive : () =>

			obj = {}

			for prop in [ "position", "scale", "rotate" ]

				target = @[prop]

				obj[prop] = {

					x : target.x
					y : target.y
					z : target.z
				}

			obj.vertexes = @vertexes

			return obj

		change_color : () =>

			@color = @get_color_rgb()


	class Line extends Particle

		ANGLE_SPEED  : { min : 0.05, max : 0.15 } # angle/ms

		AFTER_NUM : 30

		ANGLE_DISTANCE  : 0.2 # angleの間隔
		HEIGHT_DISTANCE : 5 # heightの間隔

		constructor : ( @type ) ->

			super

			@polygon  = new Array()
			@archives = new Array()

			@vertexes = [

				new Vertex3D  0, 0.5,  0
				new Vertex3D  0, -0.5, 0
			]

			@scale.x = 30
			@scale.y = Utils.clamp 30, ( if @type == 0 then 80 else 40 )

			@value_init()
			@set_position()

		render : () =>

			@polygon = []

			for archive in @archives

				render_object = Affine3Dto2D.get_render_object archive, Global.camera

				p_0 = render_object.display[0]
				p_1 = render_object.display[1]

				@polygon.push { x : Math.round( p_0.x ), y : Math.round( p_0.y ) }
				@polygon.push { x : Math.round( p_1.x ), y : Math.round( p_1.y ) }

			for i in [ 3...( max = @polygon.length ) ] by 2

				alpha = ( 1 - ( ( i / 2 ) / ( max / 2 ) ) ) / 0.35
				alpha = 0.8 if alpha > 0.8

				ctx.fillStyle = "rgba(#{@color.r},#{@color.g},#{@color.b},#{alpha})"

				ctx.beginPath()
				ctx.moveTo @polygon[i].x, @polygon[i].y

				ctx.lineTo @polygon[i - 1].x, @polygon[i - 1].y

				if @type == 0

					ctx.lineTo @polygon[i - 3].x, @polygon[i - 3].y
					ctx.lineTo @polygon[i - 2].x, @polygon[i - 2].y

				else if @type == 1

					ctx.lineTo @polygon[i - 2].x, @polygon[i - 2].y
					ctx.lineTo @polygon[i - 3].x, @polygon[i - 3].y

				ctx.closePath()

				ctx.fill()


	class Dots extends Particle

		ANGLE_SPEED  : { min : 0.2, max : 0.3 } # angle/ms

		AFTER_NUM : 10

		ANGLE_DISTANCE  : 0.2 # angleの間隔
		HEIGHT_DISTANCE : 5 # heightの間隔

		constructor : () ->

			super

			@dots     = new Array()
			@archives = new Array()

			@vertexes = [

				new Vertex3D  0, 0,  0
			]

			@value_init()
			@set_position()

		render : () =>

			@dots = []

			for archive in @archives

				render_object = Affine3Dto2D.get_render_object archive, Global.camera

				@dots.push {

					x : render_object.display[0].x
					y : render_object.display[0].y
					d : render_object.projection[0].d
				}

			for i in [ 0...( max = @dots.length ) ]

				dot = @dots[i]

				alpha = 1 - ( i / max )
				
				ctx.fillStyle = "rgba(#{@color.r},#{@color.g},#{@color.b},#{alpha})"

				r = ( 1 - dot.d ) * 10

				ctx.beginPath()
				ctx.arc dot.x, dot.y, r, 0, 360, false
				ctx.closePath()
				ctx.fill()


	class Camera

		SPEED : 0.01 * ( Math.PI / 180 ) # angle/ms

		POSITION_RADIUS : 2100

		zoom : 1

		clip : { # 範囲（z軸）

			near : 100
			far  : 5000
		}

		target : {
			
			x : 0
			y : 0
			z : 0
		}

		constructor : ( @display_w, @display_h ) ->

			@aspect = @display_w / @display_h

			@display = {
				
				x : @display_w * 0.5
				y : @display_h * 0.5
			}

			@init()

		init : () =>

			@phi_direction = 1

			@set_position @POSITION_RADIUS, 0.1, 0.2

			@set_top Math.PI / 2

			@set_value()

		set_position : ( r, theta, phi ) =>
	
			@position = {
	
				r     : r
				theta : theta
				phi   : phi
				x     : r * Math.sin( phi ) * Math.cos( theta )
				y     : r * Math.sin( phi ) * Math.sin( theta )
				z     : r * Math.cos( phi )
			}

		set_top : ( angle ) =>

			@top = {

				angle : angle
				x : Math.cos( angle )
				y : Math.sin( angle )
				z : 0
			}

		set_value : ( d ) =>

			do () => # axis_z

				x = @position.x - @target.x
				y = @position.y - @target.y
				z = @position.z - @target.z

				l = Math.sqrt ( x * x ) + ( y * y ) + ( z * z )

				@view_axis_z = new Vector3D ( x / l ), ( y / l ), ( z / l )

			do () => # axis_x

				a1 = @top.x
				a2 = @top.y
				a3 = @top.z

				b1 = @view_axis_z.x
				b2 = @view_axis_z.y
				b3 = @view_axis_z.z

				x = ( a2 * b3 ) - ( a3 * b2 )
				y = ( a3 * b1 ) - ( a1 * b3 )
				z = ( a1 * b2 ) - ( a2 * b1 )

				l = Math.sqrt ( x * x ) + ( y * y ) + ( z * z )

				@view_axis_x = new Vector3D ( x / l ), ( y / l ), ( z / l )

			do () => # axis_y

				a1 = @view_axis_z.x
				a2 = @view_axis_z.y
				a3 = @view_axis_z.z

				b1 = @view_axis_x.x
				b2 = @view_axis_x.y
				b3 = @view_axis_x.z

				x = ( a2 * b3 ) - ( a3 * b2 )
				y = ( a3 * b1 ) - ( a1 * b3 )
				z = ( a1 * b2 ) - ( a2 * b1 )

				l = Math.sqrt ( x * x ) + ( y * y ) + ( z * z )

				@view_axis_y = new Vector3D ( x / l ), ( y / l ), ( z / l )

			@view_px = ( @position.x * @view_axis_x.x ) + ( @position.y * @view_axis_x.y ) + ( @position.z * @view_axis_x.z )
			@view_py = ( @position.x * @view_axis_y.x ) + ( @position.y * @view_axis_y.y ) + ( @position.z * @view_axis_y.z )
			@view_pz = ( @position.x * @view_axis_z.x ) + ( @position.y * @view_axis_z.y ) + ( @position.z * @view_axis_z.z )

			@projection_angle_x = Math.atan ( @display_w * 0.5 ) / @clip.near
			@projection_angle_y = Math.atan ( @display_h * 0.5 ) / @clip.near

		update : ( d ) =>

			r = @position.r
			t = @position.theta + ( @SPEED * d )
			p = @position.phi + ( @SPEED * d * @phi_direction )

			if t >= ( 2 * Math.PI )

				t -= ( 2 * Math.PI )

			if p >= Math.PI

				p = Math.PI - ( p - Math.PI )

				@phi_direction *= -1

			else if p <= 0

				p *= -1

				@phi_direction *= -1

			@set_position r, t, p

			top_angle = @top.angle + ( @SPEED * d )

			if top_angle >= ( 2 * Math.PI )

				top_angle -= ( 2 * Math.PI )

			@set_top top_angle

			@set_value()


	class Vertex3D

		constructor : ( x, y, z ) ->

			@x = x
			@y = y
			@z = z


	class Vector3D

		constructor : ( x, y, z ) ->

			@x = x
			@y = y
			@z = z


	class Renderer

		now : ( win.performance and ( performance.now or performance.mozNow or performance.webkitNow ) ) or Date.now

		objects : new Array()

		constructor : () ->

			@init()

		init : () =>

			@setup_update()

		get_time : () =>

			return @now.call( win.performance )

		setup_update : () =>
		
			@timeoutID = null
			@last_time = @get_time()

			@update()

		update : () =>

			return if @timeoutID isnt null

			now_time = @get_time()

			@clear()
			@render now_time - @last_time

			@timeoutID = setTimeout =>

				@timeoutID = null

				@update()

			, 1000 / FPS

			@last_time = now_time

		clear : () =>

			ctx.clearRect 0, 0, cvs_l, cvs_l

		render : ( delta ) =>

			return if @objects.length == 0 or not @camera

			@camera.update delta

			for object in @objects

				object.update delta

		add_object : ( obj ) =>

			@objects.push obj

		set_camera : ( camera ) =>

			@camera = camera


	class Utils

		constructor : () ->

			throw "Utils cant be instantiated."

		@clamp : ( min, max ) =>

			return Math.random() * ( max - min ) + min

		@central : ( p1, p2 ) =>

			return ( p2 - p1 ) * 0.5 + p1

		@central2d : ( p1, p2 ) =>

			return {
				x : ( p2.x - p1.x ) * 0.5 + p1.x
				y : ( p2.y - p1.y ) * 0.5 + p1.y
			}

		@round : ( num ) =>

			return Math.round( num * 10 ) / 10

		@dtr : ( d ) =>

			return d * ( Math.PI / 180 )

		@rtd : ( r ) =>

			return r * ( 180 / Math.PI )
	


	class Affine3Dto2D # static

		constructor : () ->

			throw "Affine3Dto2D cant be instantiated."

		@get_render_object : ( object3d, camera ) =>

			render_object = new Object()

			render_object.world      = @world object3d
			render_object.view       = @view object3d, render_object.world, camera
			render_object.projection = @projection render_object.view, camera
			render_object.display    = @display render_object.projection, camera

			return render_object

		@world : ( object3d ) =>

			arr = new Array()

			for vertex in object3d.vertexes

				obj = {

					x : vertex.x
					y : vertex.y
					z : vertex.z
				}

				do () => # scale

					obj.x *= object3d.scale.x
					obj.y *= object3d.scale.y
					obj.z *= object3d.scale.z

				do () => # rotate x

					radian_x = Utils.dtr object3d.rotate.x

					y = ( obj.y * Math.cos( radian_x ) ) - ( obj.z * Math.sin( radian_x ) )
					z = ( obj.y * Math.sin( radian_x ) ) + ( obj.z * Math.cos( radian_x ) )

					obj.y = y
					obj.z = z

				do () => # rotate y

					radian_y = Utils.dtr object3d.rotate.y

					x = ( obj.x * Math.cos( radian_y ) ) + ( obj.z * Math.sin( radian_y ) )
					z = ( obj.x * -1 * Math.sin( radian_y ) ) + ( obj.z * Math.cos( radian_y ) )

					obj.x = x
					obj.z = z

				do () => # rotate z

					radian_z = Utils.dtr object3d.rotate.z

					x = ( obj.x * Math.cos( radian_z ) ) - ( obj.y * Math.sin( radian_z ) )
					y = ( obj.x * Math.sin( radian_z ) ) + ( obj.y * Math.cos( radian_z ) )

					obj.x = x
					obj.y = y

				do () => # position z

					obj.x += object3d.position.x
					obj.y += object3d.position.y
					obj.z += object3d.position.z

				arr.push obj

			return arr

		@view : ( object3d, world, camera ) =>

			arr = new Array()

			for vertex in world

				obj = {

					x : vertex.x
					y : vertex.y
					z : vertex.z
				}

				x = ( obj.x * camera.view_axis_x.x ) + ( obj.y * camera.view_axis_x.y ) + ( obj.z * camera.view_axis_x.z ) - camera.view_px
				y = ( obj.x * camera.view_axis_y.x ) + ( obj.y * camera.view_axis_y.y ) + ( obj.z * camera.view_axis_y.z ) - camera.view_py
				z = ( obj.x * camera.view_axis_z.x ) + ( obj.y * camera.view_axis_z.y ) + ( obj.z * camera.view_axis_z.z ) - camera.view_pz

				obj.x = x
				obj.y = y
				obj.z = z
	
				arr.push obj

			return arr

		@projection : ( view, camera ) =>

			arr = new Array()

			for vertex in view

				arr.push {

					x : ( vertex.x / ( Math.tan( camera.projection_angle_x * 0.5 ) * ( vertex.z * -1 ) ) ) * camera.display.x * camera.zoom
					y : ( vertex.y / ( Math.tan( camera.projection_angle_y * 0.5 ) * ( vertex.z * -1 ) ) ) * camera.display.y * camera.zoom
					d : vertex.z * -1 / camera.clip.far
				}

			return arr

		@display : ( projection, camera ) =>

			arr = new Array()

			for vertex in projection

				arr.push {

					x : vertex.x + camera.display.x
					y : ( vertex.y * -1 ) + camera.display.y
				}

			return arr


	win.addEventListener "load", =>

		new Main()

	, false
