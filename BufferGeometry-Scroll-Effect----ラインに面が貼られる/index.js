(function(win, doc) {

    //-----------------------
    // Constant
    //-----------------------
    var WIDTH = 465;
    var HEIGHT = 465;

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

        this.scene = new THREE.Scene();

        this.light1 = new THREE.DirectionalLight( 0xffffff, 1.0 );
        this.light1.position.set( 1, 1, 1 );
        this.scene.add( this.light1 );

		this.scene.add( new THREE.AmbientLight( 0xcde3e2 ) );

        this.lineMesh = this.createLineMesh();
        this.scene.add( this.lineMesh );

        this.lineSegments = this.createLineSegments();
        this.scene.add( this.lineSegments );

        this.animateCountTime = 0;

        this.setUpdate();
        this.setEvents();
    };

    Main.prototype.setEvents = function() {

        $(win).on("scroll", function() {
            var scT = $(win).scrollTop();

            if( scT > 1500 ) {
                this.isScDown = true;
            }
            else {
                this.isScDown = false;
            }

        }.bind(this));

        setTimeout(function() {
            $(window).scrollTop(0);
        }, 100);
        
    };

    Main.prototype.setCamera = function() {
        this.camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 0.1, 40000 );
        this.camera.position.y = 70;
        this.camera.position.z = 140;
        this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    };

    Main.prototype.setRenderer = function() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        this.renderer.setSize( WIDTH, HEIGHT );
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.container.appendChild( this.renderer.domElement );
    };

    Main.prototype.setUpdate = function() {
        this.ticker = new Ticker( true );
        this.ticker.addListener(this.update.bind(this));
    };

    Main.prototype.update = function( evt ) {

        this.animate(evt.delta);
        this.renderer.render(this.scene, this.camera);
    };

    Main.prototype.createLineMesh = function() {

        this.material = new THREE.MeshLambertMaterial({
            color: 0x999999,
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors,
        });
    

        var faceCount = faces.length;

        var arrCount = faceCount * 3 * 3;

        this.lineMeshPositions = new Float32Array(arrCount);
        this.lineMeshColors = new Float32Array(arrCount);
        this.lineMeshNormals = new Float32Array(arrCount);

        this.lineMeshFirstPositions = new Float32Array(faceCount * 3);

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

            this.lineMeshNormals[ nori++ ] = normals_data[n0][0];
            this.lineMeshNormals[ nori++ ] = normals_data[n0][1];
            this.lineMeshNormals[ nori++ ] = normals_data[n0][2];

            this.lineMeshNormals[ nori++ ] = normals_data[n1][0];
            this.lineMeshNormals[ nori++ ] = normals_data[n1][1];
            this.lineMeshNormals[ nori++ ] = normals_data[n1][2];

            this.lineMeshNormals[ nori++ ] = normals_data[n2][0];
            this.lineMeshNormals[ nori++ ] = normals_data[n2][1];
            this.lineMeshNormals[ nori++ ] = normals_data[n2][2];

            this.lineMeshFirstPositions[ rani++ ] = Math.random() * 100 - 50;
            this.lineMeshFirstPositions[ rani++ ] = Math.random() * 100 - 50;
            this.lineMeshFirstPositions[ rani++ ] = Math.random() * 100 - 50;
        };

        this.geometry = new THREE.BufferGeometry();

        this.geometry.addAttribute("position", new THREE.BufferAttribute( this.lineMeshPositions, 3 ).setDynamic( true ));
        this.geometry.addAttribute("color", new THREE.BufferAttribute( this.lineMeshColors, 3 ).setDynamic( true ));
        this.geometry.addAttribute("normal", new THREE.BufferAttribute( this.lineMeshNormals, 3 ).setDynamic( true ));

        return new THREE.Mesh( this.geometry, this.material );
    };

    Main.prototype.createLineSegments = function() {

        this.material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true,
            linecap: "round",
            linejoin:  "round"
        });

        var pointCount = vertex_data.length;
        var linePointCount = (pointCount-1) * 2 * pointCount;

        var pointPositions = new Float32Array(pointCount * 3);

        var linePointPositions = new Float32Array(linePointCount * 3);
        var linePointColors = new Float32Array(linePointCount * 3);

        for( var i = 0, imax = pointCount; i < imax; ++i ) {

            pointPositions[ i * 3     ] = vertex_data[i][0];
            pointPositions[ i * 3 + 1 ] = vertex_data[i][1];
            pointPositions[ i * 3 + 2 ] = vertex_data[i][2];
        }

        var posi = 0;
        var coli = 0;


        for( var i = 0, imax = faces.length; i < imax; ++i ) {

            var i0 = faces[i][0] - 1;
            var i1 = faces[i][1] - 1;
            var i2 = faces[i][2] - 1;

            i0 = Math.min(i0, pointCount-1);
            i1 = Math.min(i1, pointCount-1);
            i2 = Math.min(i2, pointCount-1);

            linePointPositions[ posi++ ] = vertex_data[i0][0];
            linePointPositions[ posi++ ] = vertex_data[i0][1];
            linePointPositions[ posi++ ] = vertex_data[i0][2];

            linePointPositions[ posi++ ] = vertex_data[i1][0];
            linePointPositions[ posi++ ] = vertex_data[i1][1];
            linePointPositions[ posi++ ] = vertex_data[i1][2];

            linePointPositions[ posi++ ] = vertex_data[i0][0];
            linePointPositions[ posi++ ] = vertex_data[i0][1];
            linePointPositions[ posi++ ] = vertex_data[i0][2];

            linePointPositions[ posi++ ] = vertex_data[i2][0];
            linePointPositions[ posi++ ] = vertex_data[i2][1];
            linePointPositions[ posi++ ] = vertex_data[i2][2];

            linePointPositions[ posi++ ] = vertex_data[i1][0];
            linePointPositions[ posi++ ] = vertex_data[i1][1];
            linePointPositions[ posi++ ] = vertex_data[i1][2];

            linePointPositions[ posi++ ] = vertex_data[i2][0];
            linePointPositions[ posi++ ] = vertex_data[i2][1];
            linePointPositions[ posi++ ] = vertex_data[i2][2];

            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;

            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;

            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;

            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;

            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;

            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
            linePointColors[ coli++ ] = 0.1;
        }

        this.lineGeometry = new THREE.BufferGeometry();

        this.lineGeometry.addAttribute("position", new THREE.BufferAttribute( linePointPositions, 3 ).setDynamic( true ));
        this.lineGeometry.addAttribute("color", new THREE.BufferAttribute( linePointColors, 3 ).setDynamic( true ));

        return new THREE.LineSegments( this.lineGeometry, this.material );
    };

    Main.prototype.animate = function( delta ) {

        if( this.isScDown ) {
            this.animateCountTime += delta;
        }
        else {
            this.animateCountTime -= delta;
        }

        this.animateCountTime = Utils.clamp(this.animateCountTime, 0, 1000);

        var t = this.animateCountTime / 1000;
        var r = 1 - t;
        t = Utils.clamp(t,0,1);
        r = Utils.clamp(r,0,1);
        r = TWEEN.Easing.Cubic.In(r);

        this.lineMesh.rotation.y = Utils.mix(1.5,-1.0,t);
        this.lineSegments.rotation.y = Utils.mix(0.0,-1.0,t);

        this.camera.position.y = Utils.mix(5,2,t);
        this.camera.position.z = Utils.mix(7,4,t);
        this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

        if( t <= 0 ) {
            this.lineMesh.visible = false;
        }
        else {
            this.lineMesh.visible = true;
        }
        

        var posi = 0;
        var rani = 0;

        for( var i = 0, imax = faces.length; i < imax; ++i ) {

            var i0 = faces[i][0] - 1;
            var i1 = faces[i][1] - 1;
            var i2 = faces[i][2] - 1;

            var ranx = this.lineMeshFirstPositions[ rani++ ];
            var rany = this.lineMeshFirstPositions[ rani++ ];
            var ranz = this.lineMeshFirstPositions[ rani++ ];

            this.lineMeshPositions[ posi++ ] = vertex_data[i0][0] + ( ranx * r );
            this.lineMeshPositions[ posi++ ] = vertex_data[i0][1] + ( rany * r );
            this.lineMeshPositions[ posi++ ] = vertex_data[i0][2] + ( ranz * r );

            this.lineMeshPositions[ posi++ ] = vertex_data[i1][0] + ( ranx * r );
            this.lineMeshPositions[ posi++ ] = vertex_data[i1][1] + ( rany * r );
            this.lineMeshPositions[ posi++ ] = vertex_data[i1][2] + ( ranz * r );

            this.lineMeshPositions[ posi++ ] = vertex_data[i2][0] + ( ranx * r );
            this.lineMeshPositions[ posi++ ] = vertex_data[i2][1] + ( rany * r );
            this.lineMeshPositions[ posi++ ] = vertex_data[i2][2] + ( ranz * r );
        }

        this.lineMesh.geometry.attributes.position.needsUpdate = true;
        this.lineMesh.geometry.attributes.color.needsUpdate = true;
    };


    //-----------------------
    // Entry Point
    //-----------------------
    window.addEventListener("load", function() {
        new Main();
    });


})(window, document);


