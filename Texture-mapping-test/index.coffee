
do ( win = window, doc = document ) =>

	IMAGE_PATH = "http://jsrun.it/assets/6/C/1/P/6C1Pr.png"

	CANVAS_W = 465
	CANVAS_H = 465

	cvs = doc.getElementById "c"
	ctx = cvs.getContext "2d"

	cvs.width  = CANVAS_W
	cvs.height = CANVAS_H

	texture = new Image()

	DEBUG = true

	class Main

		HORIZONTAL_N : 3
		VERTICAL_N   : 3

		constructor : () ->

			@init()

		init : () =>

			@texture_w = texture.width
			@texture_h = texture.height

			@set_3()

		set_2 : () =>

			@p0 = { x : 50,  y : 30  }
			@p1 = { x : 250, y : 50  }
			@p2 = { x : 420, y : 40  }

			@p3 = { x : 100, y : 200 }
			@p4 = { x : 230, y : 220 }
			@p5 = { x : 380, y : 250 }

			@p6 = { x : 100, y : 430 }
			@p7 = { x : 230, y : 400 }
			@p8 = { x : 400, y : 410 }

			@faces = [

				[ 0, 1, 3 ], [ 1, 3, 4 ]
				[ 1, 2, 4 ], [ 2, 4, 5 ]
				[ 3, 4, 6 ], [ 4, 6, 7 ]
				[ 4, 5, 7 ], [ 5, 7, 8 ]
			]

			@draw()
			
		set_3 : () =>

			@p0 = { x : 50,  y : 30  }
			@p1 = { x : 250, y : 50  }
			@p2 = { x : 320, y : 40  }
			@p3 = { x : 420, y : 40  }

			@p4 = { x : 100, y : 100 }
			@p5 = { x : 230, y : 120 }
			@p6 = { x : 280, y : 150 }
			@p7 = { x : 380, y : 130 }

			@p8  = { x : 100, y : 230 }
			@p9  = { x : 230, y : 200 }
			@p10 = { x : 300, y : 210 }
			@p11 = { x : 400, y : 210 }

			@p12 = { x : 50,  y : 430 }
			@p13 = { x : 230, y : 400 }
			@p14 = { x : 300, y : 410 }
			@p15 = { x : 400, y : 410 }

			@faces = [

				[ 0, 1, 4 ], [ 1, 4, 5 ]
				[ 1, 2, 5 ], [ 2, 5, 6 ]
				[ 2, 3, 6 ], [ 3, 6, 7 ]

				[ 4, 5, 8  ], [ 5,  8, 9  ]
				[ 5, 6, 9  ], [ 6,  9, 10 ]
				[ 6, 7, 10 ], [ 7, 10, 11 ]

				[ 8,   9, 12 ], [ 9,  12, 13 ]
				[ 9,  10, 13 ], [ 10, 13, 14 ]
				[ 10, 11, 14 ], [ 11, 14, 15 ]
			]

			@draw()

		draw : () =>

			for i in [ 0...@faces.length ]

				face = @faces[ i ]

				x_i = ( i % ( @HORIZONTAL_N * 2 ) ) / 2 | 0
				y_i = ( i / ( @HORIZONTAL_N * 2 ) ) | 0

				p0 = @["p#{ face[ 0 ] }"]
				p1 = @["p#{ face[ 1 ] }"]
				p2 = @["p#{ face[ 2 ] }"]

				ctx.save()

				ctx.beginPath()

				ctx.moveTo p0.x, p0.y
				ctx.lineTo p1.x, p1.y
				ctx.lineTo p2.x, p2.y

				ctx.closePath()

				ctx.clip()
				
				if i % 2 is 0 # 上

					dx = p0.x
					dy = p0.y

					m11 = ( p1.x - p0.x ) / @texture_w
					m12 = ( p1.y - p0.y ) / @texture_w
					m21 = ( p2.x - p0.x ) / @texture_h
					m22 = ( p2.y - p0.y ) / @texture_h

					x = -@texture_w * x_i
					y = -@texture_h * y_i
					w = @texture_w * @HORIZONTAL_N
					h = @texture_h * @VERTICAL_N

				else # 下

					dx = p1.x
					dy = p1.y

					m11 = ( p2.x - p1.x ) / @texture_w
					m12 = ( p2.y - p1.y ) / @texture_w
					m21 = ( p2.x - p0.x ) / @texture_h
					m22 = ( p2.y - p0.y ) / @texture_h

					x = -@texture_w * x_i
					y = -@texture_h * ( y_i + 1 )
					w = @texture_w * @HORIZONTAL_N
					h = @texture_h * @VERTICAL_N

				ctx.setTransform m11, m12, m21, m22, dx, dy

				ctx.drawImage texture, x, y, w, h

				ctx.restore()

				if DEBUG

					ctx.strokeStyle = "yellow"
					ctx.lineWidth = 2
					ctx.stroke()


	texture.addEventListener "load", =>

		new Main()

	, false

	texture.src = IMAGE_PATH
