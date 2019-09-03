do (win = window, doc = document, exports = window) ->

	target = $ "#wrap"

	text = ""

	num = 0

	append = =>
    
		if num % 30 is 0
    
			target.append text
			text = ""

		if num < 170000

			setTimeout append, 0

		else
			alert "finish!!"

		text += "<p>&##{num}</p>"

		num += 1



	append()
