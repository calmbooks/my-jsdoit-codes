
do ( win = window, doc = document ) =>

	cvs = doc.getElementById "stage"
	ctx = cvs.getContext "2d"

	image = new Image()

	image.src = "http://jsrun.it/assets/l/w/g/q/lwgqr.png"

	image.addEventListener "load", =>

		ctx.drawImage image, 0, 0

		input = ctx.getImageData 0, 0, image.width, image.height

		doc.getElementById("select_filter").addEventListener "change", ( event ) =>

			value = event.target.options[ event.target.options.selectedIndex ].value

			if value is "default"

				back_default input

			else if value is "nichika"

				nichika input.data

			else if value is "gray_scale"

				gray_scale input.data

			else if value is "mosaic"

				mosaic input

		, false

	, false


	back_default = ( input ) =>

		ctx.putImageData input, 0, 0


	nichika = ( input_data ) =>

		output = ctx.createImageData image.width, image.height

		output_data = output.data

		i = input_data.length

		while 0 < i

			i -= 4

			r = input_data[ i ]
			g = input_data[ i + 1 ]
			b = input_data[ i + 2 ]

			max_val = Math.max r, g, b

			val = if max_val > 230 then 255 else 0

			output_data[ i ]     = val
			output_data[ i + 1 ] = val
			output_data[ i + 2 ] = val
			output_data[ i + 3 ] = 255

		ctx.putImageData output, 0, 0



	gray_scale = ( input_data ) =>

		output = ctx.createImageData image.width, image.height

		output_data = output.data

		i = input_data.length

		while 0 < i

			i -= 4

			r = input_data[ i ]
			g = input_data[ i + 1 ]
			b = input_data[ i + 2 ]

			max_val = Math.max r, g, b
			min_val = Math.min r, g, b

			val = ( max_val + min_val ) / 2

			output_data[ i ]     = val
			output_data[ i + 1 ] = val
			output_data[ i + 2 ] = val
			output_data[ i + 3 ] = 255

		ctx.putImageData output, 0, 0


	mosaic = ( input ) =>

		ratio = 15

		w = Math.ceil input.width / ratio
		h = Math.ceil input.height / ratio

		output = ctx.createImageData input.width, input.height

		i = 0

		ratio2d = ratio * ratio

		while i < ( w * h )

			mosaic_x = i % w
			mosaic_y = i / w | 0

			input_x = mosaic_x * ratio
			input_y = mosaic_y * ratio

			r = 0
			g = 0
			b = 0
			a = 0

			count = 0

			for j in [ 0...ratio2d ]

				x = input_x + ( j % ratio )
				y = input_y + ( j / ratio | 0 )

				rgba = get_rgba( input, x, y )

				if rgba

					r += rgba.r
					g += rgba.g
					b += rgba.b
					a += rgba.a

					count += 1

			output_rgba = {

				r : r / count
				g : g / count
				b : b / count
				a : a / count
			}

			for k in [ 0...ratio2d ]

				x = input_x + ( k % ratio )
				y = input_y + ( k / ratio | 0 )

				output = set_rgba output, x, y, output_rgba

			i += 1

		ctx.putImageData output, 0, 0


	get_rgba = ( input, x, y ) =>

		return false if x >= input.width or y >= input.height

		target = ( input.width * y + x ) * 4

		return {
			
			r : input.data[ target ]
			g : input.data[ target + 1 ]
			b : input.data[ target + 2 ]
			a : input.data[ target + 3 ]
		}

	set_rgba = ( output, x, y, rgba ) =>

		return output if x >= output.width or y >= output.height

		target = ( output.width * y + x ) * 4

		output.data[ target ]     = rgba.r
		output.data[ target + 1 ] = rgba.g
		output.data[ target + 2 ] = rgba.b
		output.data[ target + 3 ] = rgba.a

		return output
