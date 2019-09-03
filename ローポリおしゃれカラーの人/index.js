(function(win, doc) {

    //-----------------------
    // Create data
    //-----------------------
    var faces = [];
    var norIndexs = [];

    for( var i = 0, imax = face_data.length; i < imax; ++i ) {

        var tri = face_data[i].split(" ");

        var trip0 = tri[0].split("/");
        var trip1 = tri[1].split("/");
        var trip2 = tri[2].split("/");

        var _face = [];

        _face.push(trip0[0] - 0);
        _face.push(trip1[0] - 0);
        _face.push(trip2[0] - 0);

        faces.push(_face);

        var _nor = [];

        _nor.push(trip0[2] - 0);
        _nor.push(trip1[2] - 0);
        _nor.push(trip2[2] - 0);

        norIndexs.push(_nor);
    }

    //-----------------------
    // Main
    //-----------------------
    function Main() {
        this.container = document.getElementById("container");
        this.setup();
    }

    Main.prototype.setup = function() {

        this.setCamera();
        this.setRenderer();

        var controls = new THREE.OrbitControls( this.camera, this.container );

        this.scene = new THREE.Scene();

        this.light1 = new THREE.DirectionalLight( 0xaaaaaa, 1.0 );
        this.light1.position.set( 0, 1, 1 );
        this.scene.add( this.light1 );

        this.light2 = new THREE.DirectionalLight( 0x999999, 1.0 );
        this.light2.position.set( 0, -1, -1 );
        this.scene.add( this.light2 );

		this.scene.add( new THREE.AmbientLight( 0xcde3e2 ) );

        this.lineMesh = this.createLineMesh();
        this.lineMesh.position.y = -5;
        this.lineMesh.rotation.y = -0.5;
        this.scene.add( this.lineMesh );

        this.setUpdate();
        this.setEvents();
    };

    Main.prototype.setCamera = function() {
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 40000 );
        this.camera.position.y = 4;
        this.camera.position.z = 7;
        this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    };

    Main.prototype.setRenderer = function() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        this.renderer.setPixelRatio( 1.0 );
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.container.appendChild( this.renderer.domElement );
    };

    Main.prototype.setEvents = function() {

        $("#colorButtons li").on("click", function( event ) {

            var index = $(event.target).index();

            if( index == 0 ) this.material.color.setHex(0xcc9999); 
            if( index == 1 ) this.material.color.setHex(0x99cc99); 
            if( index == 2 ) this.material.color.setHex(0x9999cc); 
            if( index == 3 ) this.material.color.setHex(0xcccc99); 
            if( index == 4 ) this.material.color.setHex(0x99cccc); 
            

        }.bind(this)); 
    };

    Main.prototype.setUpdate = function() {
        this.ticker = new Ticker( true );
        this.ticker.addListener(this.update.bind(this));
    };

    Main.prototype.update = function( evt ) {

        this.renderer.render(this.scene, this.camera);
    };

    Main.prototype.createLineMesh = function() {

        this.material = new THREE.MeshLambertMaterial({
            color: 0x9999cc,
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors,
        });

        var faceCount = faces.length;

        var arrCount = faceCount * 3 * 3;

        this.lineMeshPositions = new Float32Array(arrCount);
        this.lineMeshColors = new Float32Array(arrCount);
        this.lineMeshNormals = new Float32Array(arrCount);

        var posi = 0;
        var coli = 0;
        var nori = 0;
        var rani = 0;

        for( var i = 0, imax = faces.length; i < imax; ++i ) {

            var i0 = faces[i][0] - 1;
            var i1 = faces[i][1] - 1;
            var i2 = faces[i][2] - 1;

            this.lineMeshPositions[ posi++ ] = vertex_data[i0][0];
            this.lineMeshPositions[ posi++ ] = vertex_data[i0][1];
            this.lineMeshPositions[ posi++ ] = vertex_data[i0][2];

            this.lineMeshPositions[ posi++ ] = vertex_data[i1][0];
            this.lineMeshPositions[ posi++ ] = vertex_data[i1][1];
            this.lineMeshPositions[ posi++ ] = vertex_data[i1][2];

            this.lineMeshPositions[ posi++ ] = vertex_data[i2][0];
            this.lineMeshPositions[ posi++ ] = vertex_data[i2][1];
            this.lineMeshPositions[ posi++ ] = vertex_data[i2][2];

            this.lineMeshColors[ coli++ ] = 1.0;
            this.lineMeshColors[ coli++ ] = 1.0;
            this.lineMeshColors[ coli++ ] = 1.0;

            this.lineMeshColors[ coli++ ] = 1.0;
            this.lineMeshColors[ coli++ ] = 1.0;
            this.lineMeshColors[ coli++ ] = 1.0;

            this.lineMeshColors[ coli++ ] = 1.0;
            this.lineMeshColors[ coli++ ] = 1.0;
            this.lineMeshColors[ coli++ ] = 1.0;

            var n0 = norIndexs[i][0] - 1;
            var n1 = norIndexs[i][1] - 1;
            var n2 = norIndexs[i][2] - 1;

            var flatN0 = Utils.mix(normals_data[n0][0], normals_data[n1][0], 0.5);
            var flatN1 = Utils.mix(normals_data[n0][1], normals_data[n1][1], 0.5);
            var flatN2 = Utils.mix(normals_data[n0][2], normals_data[n1][2], 0.5);

            flatN0 = Utils.mix(flatN0, normals_data[n2][0], 0.5);
            flatN1 = Utils.mix(flatN1, normals_data[n2][1], 0.5);
            flatN2 = Utils.mix(flatN2, normals_data[n2][2], 0.5);

            this.lineMeshNormals[ nori++ ] = flatN0;
            this.lineMeshNormals[ nori++ ] = flatN1;
            this.lineMeshNormals[ nori++ ] = flatN2;

            this.lineMeshNormals[ nori++ ] = flatN0;
            this.lineMeshNormals[ nori++ ] = flatN1;
            this.lineMeshNormals[ nori++ ] = flatN2;

            this.lineMeshNormals[ nori++ ] = flatN0;
            this.lineMeshNormals[ nori++ ] = flatN1;
            this.lineMeshNormals[ nori++ ] = flatN2;
        };

        this.geometry = new THREE.BufferGeometry();

        this.geometry.addAttribute("position", new THREE.BufferAttribute( this.lineMeshPositions, 3 ).setDynamic( true ));
        this.geometry.addAttribute("color", new THREE.BufferAttribute( this.lineMeshColors, 3 ).setDynamic( true ));
        this.geometry.addAttribute("normal", new THREE.BufferAttribute( this.lineMeshNormals, 3 ).setDynamic( true ));

        return new THREE.Mesh( this.geometry, this.material );
    };


    //-----------------------
    // Entry Point
    //-----------------------
    window.addEventListener("load", function() {
        new Main();
    });


})(window, document);


