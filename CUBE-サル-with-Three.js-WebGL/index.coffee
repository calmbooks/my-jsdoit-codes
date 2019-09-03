do (win = window, doc = document) ->

	class Main

		constructor : () ->

			@scene_W  = 465
			@scene_H = 465

			@scene = new THREE.Scene()



		mouse_events : =>

			data = {}

			reset = =>

				clearInterval data.release_timer

				data = {

					from_X : false
					from_Y : false
					move_X : 0
					move_Y : 0
					release_timer : 0
				}


			move = (event) =>

				from_X = data.from_X
				from_Y = data.from_Y

				page_X = event.pageX
				page_Y = event.pageY

				data.move_X = if from_X then from_X - page_X else 0
				data.move_Y = if from_Y then from_Y - page_Y else 0

				@rote_X += ( data.move_Y * -0.02 )
				@rote_Y += ( data.move_X * -0.02 )

				data.from_X = page_X
				data.from_Y = page_Y


			release = =>

				data.move_X *= 0.9
				data.move_Y *= 0.9

				@rote_X += ( data.move_Y * -0.02 )
				@rote_Y += ( data.move_X * -0.02 )

				reset() if -0.1 < data.move_X < 0.1 and -0.1 < data.move_Y < 0.1


			mousedown_handler = =>

				reset()

				doc.body.addEventListener "mousemove", mousemove_handler, false
				doc.body.addEventListener "mouseup",   mouseup_handler,   false


			mousemove_handler = (event) =>

				move event


			mouseup_handler = (event) =>

				data.release_timer = setInterval release, 30

				doc.body.removeEventListener "mousemove", mousemove_handler, false
				doc.body.removeEventListener "mouseup",   mouseup_handler,   false


			doc.querySelector("#stage_wrap canvas").addEventListener "mousedown", mousedown_handler, false


		rendering : =>

			@cubeMesh.rotation.x = @rote_X
			@cubeMesh.rotation.y = @rote_Y

			@renderer.render @scene, @camera

			setTimeout @rendering, 30


		init : =>

			fov    = 80
			aspect = @scene_W / @scene_H
			near   = 1
			far    = 1000

			@camera = new THREE.PerspectiveCamera fov, aspect, near, far
			@camera.position.z = 500

			materials = [
				new THREE.MeshLambertMaterial({ map : THREE.ImageUtils.loadTexture "http://jsrun.it/assets/2/N/A/0/2NA0j.png" })
				new THREE.MeshLambertMaterial({ map : THREE.ImageUtils.loadTexture "http://jsrun.it/assets/1/h/M/z/1hMzv.png" })
				new THREE.MeshLambertMaterial({ map : THREE.ImageUtils.loadTexture "http://jsrun.it/assets/n/z/w/l/nzwlI.png" })
				new THREE.MeshLambertMaterial({ map : THREE.ImageUtils.loadTexture "http://jsrun.it/assets/h/D/k/D/hDkDT.png" })
				new THREE.MeshLambertMaterial({ map : THREE.ImageUtils.loadTexture "http://jsrun.it/assets/A/1/9/W/A19WR.png" })
				new THREE.MeshLambertMaterial({ map : THREE.ImageUtils.loadTexture "http://jsrun.it/assets/r/t/c/d/rtcdI.png" })
			]

			material = new THREE.MeshFaceMaterial materials
			geometry = new THREE.CubeGeometry 200, 200, 200

			@cubeMesh = new THREE.Mesh geometry, material

			@scene.add @cubeMesh

			@cubeLight = new THREE.AmbientLight 0xffffff
			@cubeLight.position.z = 3

			@scene.add @cubeLight
			

			@renderer = new THREE.WebGLRenderer()

			@renderer.setSize @scene_W, @scene_H

			doc.getElementById("stage_wrap").appendChild @renderer.domElement

			@mouse_events()

			@rote_X = Math.PI * 0.7
			@rote_Y = Math.PI / 4

			@rendering()




	win.addEventListener "load", =>

		main = new Main()

		main.init()


	,false
