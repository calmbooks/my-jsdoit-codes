class Fireworks

	SPARK_NUM     : 300
	INTERVAL      : 15
	FIREWORKS_MAX : 3

	sparks : []
	intervalTimer : 0

	is_length : false
	fireworks_length : 0

	loop : ->

		update_sparks = []
	
		for spark in @sparks

			if spark.size > 0.3

				spark.update()
				update_sparks.push(spark)


		@sparks = update_sparks
		@fireworks_length = @sparks.length / @SPARK_NUM | 0

		@context.clearRect(0, 0, @stage_W, @stage_H)

		@context.globalAlpha = 0.85

		@context.drawImage(@clone_canvas, 0, 0)

		@draw_spark()
        
        @clone_canvas = @canvas.cloneNode()

		if @fireworks_length is 0

			clearInterval(@intervalTimer)

			@context.clearRect(0, 0, @stage_W, @stage_H)




	draw_spark : ->

		@context.globalCompositeOperation = "lighter"
		@context.globalAlpha = 1


		for spark in @sparks

			@context.beginPath() 
			@context.arc(spark.positon_X, spark.positon_Y, spark.size, 0, Math.PI*2, false)
			@context.fillStyle = spark.color
			@context.fill()


	create : ( start_X, start_Y ) ->

		if @fireworks_length >= @FIREWORKS_MAX
				
			return

		for i in [0...@SPARK_NUM]

			spark = new Spark
			spark.init()

			spark.positon_X = start_X
			spark.positon_Y = start_Y

			@sparks.push(spark)

		if @fireworks_length is 0

			@intervalTimer = setInterval =>

				@loop()

			,@INTERVAL

		@fireworks_length += 1

	canvas_resize : ->

		@stage_W = window.innerWidth
		@stage_H = window.innerHeight

		@canvas.width  = @stage_W
		@canvas.height = @stage_H

		@canvas_before.width = @stage_W
		@canvas_before.height = @stage_H


	init : ->

		@canvas  = document.getElementById("area")
		@context = @canvas.getContext("2d")

		@create(200, 200)

		document.addEventListener "mousedown" , (e) =>

			@create(e.pageX, e.pageY)

		,false

		document.addEventListener "touchstart" , (e) =>

			@create(e.touches[0].pageX, e.touches[0].pageY)

		,false

		window.addEventListener("resize", =>
			@canvas_resize()
		, false)
        
		@canvas_resize()



class Spark

	SIZE     : 2.5
	COLOR    : "rgba(255,220,100,1)"
	DECAY    : 0.98
	GRAVITY  : 1.5

	positon_X : 0
	positon_Y : 0

	init : ->

		angle    = Math.random() * (2 * Math.PI)
		angle    = ( angle * 5 | 0 ) / 5
		velocity = Math.random() * 5.5
		velocity = ( velocity * 2 | 0 ) / 2
		velocity = 4.5 if velocity > 4.5

		@velocity_X = Math.cos(angle) * velocity
		@velocity_Y = Math.sin(angle) * velocity

		@color = @COLOR
		@size  = @SIZE

	update : ->

		@velocity_X *= @DECAY
		@velocity_Y *= @DECAY

		@size *= @DECAY

		@positon_X += @velocity_X
		@positon_Y += @velocity_Y

		@positon_Y += @GRAVITY


window.addEventListener "load", ->

	fireworks = new Fireworks
	fireworks.init()

,false
