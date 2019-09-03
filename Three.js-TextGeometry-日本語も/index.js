(function( win, doc ) {

    var TEXT = "あアA2";

	var FPS = 30;

	var STAGE_W = 465;
	var STAGE_H = 465;
	var ASPECT = STAGE_W / STAGE_H;

	var CANVAS = doc.getElementById("c");
	var FOV = 60;

	var now = ( win.performance && ( performance.now || performance.mozNow || performance.webkitNow ) ) || Date.now;

	function Main () {

		this.init();
	}

	var p = Main.prototype;

	p.init = function () {

		this.renderer = new THREE.WebGLRenderer({ antialias : true, canvas : CANVAS, devicePixelRatio : 1 });

		this.renderer.setSize(STAGE_W, STAGE_H);
		this.renderer.setClearColor(0xFFCC00, 1);

		this.scene = new THREE.Scene();

		this.setLight();
		this.setCamera();
		this.setHelper();

		this.setTextMesh();
		this.setupUpdate();
    }

	p.setLight = function () {

		this.directionalLight = new THREE.DirectionalLight(0xFFFFFF);
		this.directionalLight.position = new THREE.Vector3(0, 10, 10);

		this.ambientLight = new THREE.AmbientLight(0x777777);

		this.scene.add(this.directionalLight);
		this.scene.add(this.ambientLight);
    }

	p.setCamera = function () {

		this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.1, 1000);
		this.camera.position = new THREE.Vector3(0, 3, 15);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.scene.add(this.camera);
    }

	p.setHelper = function () {

		this.trackball = new THREE.TrackballControls(this.camera, CANVAS);

		this.scene.add(new THREE.GridHelper(3, 0.5));
		this.scene.add(new THREE.AxisHelper(50.0));
    }

	p.setTextMesh = function () {

        var prm = {

            size : 3,
            height : 1,
            curveSegments : 5,
            bevelEnabled : true,
            bevelThickness : 0.2,
            bevelSize : 0.1,
            font : "07yasashisagothicbold",
            weight : "normal",
            style : "normal"
        };

        var geo = new THREE.TextGeometry(TEXT, prm);
        var mat = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );

        mat.ambient = new THREE.Color(0xFF0000);

        this.textMesh = new THREE.Mesh( geo, mat );
        this.textMesh.position = new THREE.Vector3(-8, 0, 0);

        console.log(this.textMesh);

		this.scene.add(this.textMesh);
    }

	p.getTime = function () {

		return now.call( win.performance );
	}

	p.setupUpdate = function () {

		this.timeout_id = null;
		this.lastTime  = this.getTime();

		this.update();
	}

	p.update = function () {

		if( this.timeout_id != null ) return;

		var nowTime = this.getTime();

		var delta = nowTime - this.lastTime;

		this.renderer.render( this.scene, this.camera );

		this.trackball.update();

		var _this = this;

		this.timeout_id = setTimeout( function() {

			_this.timeout_id = null;

			_this.update();

		}, 1000 / FPS );

		this.lastTime = nowTime;
	}

	win.addEventListener( "load", function() {

		new Main();

	} ,false );

})(window, document);
