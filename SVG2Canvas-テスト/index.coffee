do (win = window, doc = document, exports = window) ->


	class Main

		init : =>

			num0 = doc.querySelector("#test_svg path").getAttribute "d"

			num1 = num0.replace " ", ""
			num2 = num1.replace /([a-z]|[A-Z])/g, " $1"
			num3 = num2.replace /([0-9])(-)/g, "$1,$2"

			path_array = num3.split " "

			canvas  = doc.getElementById "stage"
			context = canvas.getContext "2d"

			current_X = 0
			current_Y = 0

			context.beginPath()

			path_array.forEach (line) =>

				str  = line.slice 0, 1
				num  = line.slice 1
				nums = num.split(",")

				if str is "m"

					current_X += nums[0] - 0
					current_Y += nums[1] - 0

					context.moveTo current_X, current_Y

				else if str is "M"

					current_X = nums[0] - 0
					current_Y = nums[1] - 0

					context.moveTo current_X, current_Y

				else if str is "l"

					current_X += nums[0] - 0
					current_Y += nums[1] - 0

					context.lineTo current_X, current_Y

				else if str is "L"

					current_X = nums[0] - 0
					current_Y = nums[1] - 0

					context.lineTo current_X, current_Y

				else if str is "h"

					current_X += nums[0] - 0

					context.lineTo current_X, current_Y

				else if str is "H"

					current_X = nums[0] - 0

					context.lineTo current_X, current_Y

				else if str is "v"

					current_Y += nums[0] - 0

					context.lineTo current_X, current_Y

				else if str is "V"

					current_Y = nums[0] - 0

					context.lineTo current_X, current_Y

				else if str is "c"

					cp1_X = current_X + ( nums[0] - 0 )
					cp1_Y = current_Y + ( nums[1] - 0 )

					cp2_X = current_X + ( nums[2] - 0 )
					cp2_Y = current_Y + ( nums[3] - 0 )

					current_X += nums[4] - 0
					current_Y += nums[5] - 0

					context.bezierCurveTo cp1_X, cp1_Y, cp2_X, cp2_Y, current_X, current_Y

				else if str is "C"

					cp1_X = nums[0] - 0
					cp1_Y = nums[1] - 0

					cp2_X = nums[2] - 0
					cp2_Y = nums[3] - 0

					current_X = nums[4] - 0
					current_Y = nums[5] - 0

					context.bezierCurveTo cp1_X, cp1_Y, cp2_X, cp2_Y, current_X, current_Y
				

				else if str is "z"

					context.closePath()



			context.closePath()
			context.fillStyle = "white"
			context.fill()





	win.addEventListener "load", =>

		main = new Main()
		main.init()

	,false
