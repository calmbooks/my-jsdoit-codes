
(function(win, doc, ns, $) {

    //-----------------------
    // Import
    //-----------------------
    var System = win.Utils;
    var Ticker = win.Ticker;

    //-----------------------
    // Constant
    //----------------------- 
    var COLOR_SKIN = [
        [ 1.0, 0.8, 0.4 ],
        [ 0.3, 1.0, 0.7 ],
        [ 0.3, 0.7, 1.0 ],
        [ 1.0, 0.6, 0.7 ]
    ];

    //-----------------------
    // BgMesh
    //-----------------------
    function BgMesh( prm ) {

        this.diffX = prm.diffX;
        this.diffY = prm.diffY;

        this.areaW = prm.areaW;
        this.areaH = prm.areaH;

        this.tileX = prm.tileX;
        this.tileY = prm.tileY;

        this.colorIndex = prm.colorIndex;

        this.animateFloatCountTime = 0;

        this.setup();
    }

    BgMesh.prototype.setup = function() {

        this.computeVertexData();

        this.mesh = this.createLineMesh();

        this.setupFloatPositions();
    };

    BgMesh.prototype.computeVertexData = function() {

        var vertex_data = [];
        var face_data = [];

        var ranZ = 0;

        for( var x = 0, xmax = this.tileX; x < xmax; ++x ) {

            for( var y = 0, ymax = this.tileY; y < ymax; ++y ) {

                var b0 = x == 0 && y == 0;
                var b1 = x == this.tileX-1 && y == 0;
                var b2 = x == 0 && y == this.tileY-1;
                var b3 = x == this.tileX-1 && y == this.tileY-1;

                if( b0 || b1 || b2 || b3 ) continue;

                var cx = (( this.areaW / this.tileX ) * x ) + (( this.areaW / this.tileX ) * 0.5) - ( this.areaW * 0.5 );
                var cy = (( this.areaH / this.tileY ) * y ) + (( this.areaH / this.tileY ) * 0.5) - ( this.areaH * 0.5 );

                vertex_data.push([
                    cx + System.mix( -30, 30, Math.random()) + this.diffX,
                    cy + System.mix( -30, 30, Math.random()) + this.diffY,
                    System.mix( -20, 20, Math.random()) 
                ]);
            }
        }

        function checkCross( a, b, c, d ) {

            var ta = (c.x - d.x) * (a.y - c.y) + (c.y - d.y) * (c.x - a.x);
            var tb = (c.x - d.x) * (b.y - c.y) + (c.y - d.y) * (c.x - b.x);
            var tc = (a.x - b.x) * (c.y - a.y) + (a.y - b.y) * (a.x - c.x);
            var td = (a.x - b.x) * (d.y - a.y) + (a.y - b.y) * (a.x - d.x);

            return tc * td < 0 && ta * tb < 0;
        };

        function checkOnajihen( ia, ib, ic, id ) {
            if( ia == ic && ib == id ) return true;
            if( ia == id && ib == ic ) return true;
            return false;
        };

        function checkSameFaces( arr ) {

            var _arr = [];

            for( var i = 0, imax = arr.length; i < imax; ++i ) {
                var val = arr[i];
                var b = false;

                for( var j = 0, jmax = _arr.length; j < jmax; ++j ) {
                    if( val == _arr[j] ) {
                        b = true;
                        break;
                    }
                }

                if( b ) continue;

                _arr.push(val);
            }

            return _arr.length == 3;
        }

        function sortFaceIndex( _face ) {

            var topi = 0;
            var maxy = -99999;

            for( var i = 0, imax = _face.length; i < imax; ++i ) {
                
                var y = vertex_data[_face[i]][1];

                if( maxy < y ) {
                    maxy = y;
                    topi = i;
                }
            }

            var nexti = 0; 
            var mindeg = 99999;

            for( var i = 0, imax = _face.length; i < imax; ++i ) {

                if( i == topi ) continue;

                var tx = vertex_data[_face[topi]][0];
                var ty = vertex_data[_face[topi]][1];

                var x = vertex_data[_face[i]][0];
                var y = vertex_data[_face[i]][1];

                var deg = System.r2d(Math.atan2(y-ty,x-tx));

                if( mindeg > deg ) {
                    mindeg = deg;
                    nexti = i;
                }
            }

            var endi = 0;

            for( var i = 0, imax = _face.length; i < imax; ++i ) {

                if( i == topi || i == nexti ) continue;
                endi = i;            
            }

            return [ _face[topi], _face[nexti], _face[endi] ];
        }

        function startPointIndex( _i0 ) {

            var mindis = 999999;
            var _i1 = 0;

            for( var j = 0, jmax = vertex_data.length; j < jmax; ++j ) {

                if( j == _i0 ) continue;

                var vt = vertex_data[j];

                var v0 = new THREE.Vector2(vertex_data[_i0][0],vertex_data[_i0][1]);
                var vt = new THREE.Vector2(vertex_data[j][0],vertex_data[j][1]); 

                var dis = System.distance2d(v0, vt);

                if( mindis > dis ) {
                    _i1 = j;
                    mindis = dis;
                }
            }

            return _i1;
        }

        function checkUseIndex( _indexs, index ) {

            var _b = false;

            for( var i = 0, imax = _indexs.length; i < imax; ++i ) {
                if( _indexs[i] == index ) {
                    _b = true;
                    break;
                }
            }

            return _b;
        }

        function getRestIndex( _indexs ) {

            var ri = 0;

            while( true ) {

                ri = Math.floor(Math.random() * vertex_data.length);

                var _b = false;

                for( var i = 0, imax = _indexs.length; i < imax; ++i ) {
                    if( _indexs[i] == ri ) { 
                        _b = true;
                        break;
                    }
                }

                if( !_b ) break;
            }

            return ri;
        }


        var _ti0 = 0;
        var _ti1 = startPointIndex(_ti0);

        var _useIndexs = [_ti0, _ti1];

        var check_line = [[_ti0,_ti1]];
        var isLoop = true;

        while( isLoop ) {

            var ti0 = check_line[0][0];
            var ti1 = check_line[0][1];
            var ti2 = 99999;

            var v0 = new THREE.Vector2(vertex_data[ti0][0],vertex_data[ti0][1]);
            var v1 = new THREE.Vector2(vertex_data[ti1][0],vertex_data[ti1][1]);

            var ctr = System.mix2d(v0,v1,0.5);

            var mindis = 999999;

            for( var i = 0, imax = vertex_data.length; i < imax; ++i ) {

                if( ti0 == i || ti1 == i ) continue;

                var vt = new THREE.Vector2(vertex_data[i][0],vertex_data[i][1]);

                var isCross = false;
                var isSameFaces = false;

                for( var f = 0, fmax = face_data.length; f < fmax; ++f ) {

                    var fi0 = face_data[f][0];
                    var fi1 = face_data[f][1];
                    var fi2 = face_data[f][2];

                    var fv0 = new THREE.Vector2(vertex_data[fi0][0],vertex_data[fi0][1]);
                    var fv1 = new THREE.Vector2(vertex_data[fi1][0],vertex_data[fi1][1]);
                    var fv2 = new THREE.Vector2(vertex_data[fi2][0],vertex_data[fi2][1]);

                    var kb0 = checkCross(v0, vt, fv0, fv1);
                    var kb1 = checkCross(v0, vt, fv1, fv2);
                    var kb2 = checkCross(v0, vt, fv2, fv0);
                    var kb3 = checkCross(v1, vt, fv0, fv1);
                    var kb4 = checkCross(v1, vt, fv1, fv2);
                    var kb5 = checkCross(v1, vt, fv2, fv0);

                    isCross = kb0 || kb1 || kb2 || kb3 || kb4 || kb5;
                    isSameFaces = checkSameFaces([ti0, ti1, i, fi0, fi1, fi2]);

                    if( isSameFaces ) break;
                    if( isCross ) break;
                }

                if( isSameFaces ) continue; 
                if( isCross ) continue; 


                var dis = System.distance2d(ctr, vt);

                if( mindis > dis ) {
                    ti2 = i;
                    mindis = dis;
                }
            } 

            if( mindis == 999999 ) {
                check_line.shift();

                if( check_line.length == 0 ) {

                    if( vertex_data.length <= _useIndexs.length + 2 ) { // end
                        isLoop = false;
                        break; 
                    }
                    else {

                        var __ti0 = getRestIndex(_useIndexs);
                        var __ti1 = startPointIndex(__ti0);

                        check_line.push([__ti0,__ti1]);
                    }
                }

                continue;
            }

            face_data.push(sortFaceIndex([ ti0, ti1, ti2 ]));

            check_line.shift();

            check_line.unshift([ti1,ti2]);
            check_line.push([ti0,ti2]);

            if( !checkUseIndex(_useIndexs, ti2) ) _useIndexs.push(ti2);
        }

        this.vertex_data = vertex_data;
        this.face_data = face_data;
    };

    BgMesh.prototype.setupFloatPositions = function() {

        this.floatRandomPositions = new Array( this.vertex_data.length );
        this.floatRandomTimes = new Array( this.vertex_data.length );

        for( var i = 0, imax = this.face_data.length; i < imax; ++i ) {

            var i0 = this.face_data[i][0];
            var i1 = this.face_data[i][1];
            var i2 = this.face_data[i][2];

            this.floatRandomPositions[i0] = [ Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ];
            this.floatRandomPositions[i1] = [ Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ];
            this.floatRandomPositions[i2] = [ Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ];

            this.floatRandomTimes[i0] = [ Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ];
            this.floatRandomTimes[i1] = [ Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ];
            this.floatRandomTimes[i2] = [ Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ];
        }
    };

    BgMesh.prototype.createLineMesh = function() {

        this.material = new THREE.MeshLambertMaterial({
            color: 0x999999,
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors,
            transparent: true,
            opacity: 1.0
        });

        var faceCount = this.face_data.length;
        var arrCount = faceCount * 3 * 3;

        this.meshPositions = new Float32Array(arrCount);
        this.tmpMeshPositions = new Float32Array(arrCount);        
        this.meshColors = new Float32Array(arrCount);

        var posi = 0;
        var posj = 0;
        var posk = 0;
        var coli = 0;
        var nori = 0;
        var ranj = 0;
        var rank = 0;

        for( var i = 0, imax = this.face_data.length; i < imax; ++i ) {

            var i0 = this.face_data[i][0];
            var i1 = this.face_data[i][1];
            var i2 = this.face_data[i][2];

            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i0][0];
            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i0][1];
            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i0][2];

            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i1][0];
            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i1][1];
            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i1][2];

            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i2][0];
            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i2][1];
            this.tmpMeshPositions[ posi++ ] = this.vertex_data[i2][2];

            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];
            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];
            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];

            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];
            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];
            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];

            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];
            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];
            this.meshPositions[ posj++ ] = this.tmpMeshPositions[ posk++ ];

            var r = COLOR_SKIN[this.colorIndex][0];
            var g = COLOR_SKIN[this.colorIndex][1]; 
            var b = COLOR_SKIN[this.colorIndex][2];

            this.meshColors[ coli++ ] = r;
            this.meshColors[ coli++ ] = g;
            this.meshColors[ coli++ ] = b;

            this.meshColors[ coli++ ] = r;
            this.meshColors[ coli++ ] = g;
            this.meshColors[ coli++ ] = b;

            this.meshColors[ coli++ ] = r;
            this.meshColors[ coli++ ] = g;
            this.meshColors[ coli++ ] = b;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.addAttribute("position", new THREE.BufferAttribute( this.meshPositions, 3 ).setDynamic( true ));
        this.geometry.addAttribute("color", new THREE.BufferAttribute( this.meshColors, 3 ).setDynamic( true ));
        this.geometry.computeVertexNormals();

        return new THREE.Mesh( this.geometry, this.material );
    };

    BgMesh.prototype.update = function( evt ) {

        this.animateFloatCountTime += evt.delta*0.05;

        this.floatAnimate(this.animateFloatCountTime);
    };

    BgMesh.prototype.floatAnimate = function( minTime ) {

        var _target = new THREE.Vector3(34,25,-23);

        var posi = 0;
        var tmpi = 0;
        var tmpj = 0;
        var rani = 0;
        var ranj = 0;

        var mind = 999999999;
        var maxd = -999999999;

        for( var i = 0, imax = this.face_data.length; i < imax; ++i ) {

            var i0 = this.face_data[i][0];
            var i1 = this.face_data[i][1];
            var i2 = this.face_data[i][2];

            var r = 20;


            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i0][0]) * this.floatRandomPositions[i0][0] * r;
            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i0][1]) * this.floatRandomPositions[i0][1] * r;
            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i0][2]) * this.floatRandomPositions[i0][2] * r;

            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i1][0]) * this.floatRandomPositions[i1][0] * r;
            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i1][1]) * this.floatRandomPositions[i1][1] * r;
            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i1][2]) * this.floatRandomPositions[i1][2] * r;

            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i2][0]) * this.floatRandomPositions[i2][0] * r;
            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i2][1]) * this.floatRandomPositions[i2][1] * r;
            this.meshPositions[ posi++ ] = this.tmpMeshPositions[ tmpi++ ] + Math.sin(minTime * this.floatRandomTimes[i2][2]) * this.floatRandomPositions[i2][2] * r;
        }

        this.geometry.computeVertexNormals();        

        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.attributes.normal.needsUpdate = true;
    };

    //-----------------------
    // Export
    //-----------------------
    win.BgMesh = BgMesh;    
    

})(window, document, window.App, jQuery);




(function(win, doc, ns, $) {

    //-----------------------
    // Import
    //-----------------------
    var System = win.Utils;
    var BgMesh = win.BgMesh;


    //-----------------------
    // View3D
    //-----------------------
    function View3D( $container ) {

        this.$container = $container;

        this.viewWidth = this.$container.outerWidth();
        this.viewHeight = this.$container.outerHeight();

        this.isUpdate = false;

        this.currentCameraPosition = new THREE.Vector3(0,0,500);
        this.currentCameraTarget = new THREE.Vector3(0.0, 0.0, 0.0);

        this.bgMeshs = [];

        this.setup();
    }

    View3D.prototype.setup = function() {

        this.scene = new THREE.Scene();

        this.setCamera();
        this.setRenderer();
        this.setLight();

        this.createMesh(0);
    };

    View3D.prototype.createMesh = function( colorIndex ) {

        this.bgMesh = new BgMesh({
            diffX : 0.0, diffY : 0.0,
            areaW : 360, areaH : 360, 
            tileX : 6, tileY : 6,
            colorIndex : colorIndex
        });

        this.scene.add( this.bgMesh.mesh );
    };

    View3D.prototype.setLight = function() {

        this.light = new THREE.DirectionalLight( 0xffffff, 1.0 );
        this.light.position.set( 10, 10, 30 );
        this.scene.add( this.light );

		this.scene.add( new THREE.AmbientLight( 0xaaaaaa ) );
    };

    View3D.prototype.setCamera = function() {

        this.camera = new THREE.OrthographicCamera( this.viewWidth * -0.5, this.viewWidth * 0.5, this.viewHeight * 0.5, this.viewHeight * -0.5, 0.01, 10000 );

        this.camera.position.x = this.currentCameraPosition.x;
        this.camera.position.y = this.currentCameraPosition.y;
        this.camera.position.z = this.currentCameraPosition.z;
        this.camera.lookAt(this.currentCameraTarget);
    };

    View3D.prototype.setRenderer = function() {

        this.renderer = new THREE.WebGLRenderer({
            antialias : true,
            alpha : true,
        });

        this.renderer.setPixelRatio(win.devicePixelRatio);        
        this.renderer.setSize( this.viewWidth, this.viewHeight );

        this.$container[0].appendChild( this.renderer.domElement );
    };

    View3D.prototype.start = function() {

        this.isUpdate = true;
    };

    View3D.prototype.update = function( evt ) {

        if( !this.isUpdate ) return;

        this.bgMesh.update(evt);

        this.renderer.render(this.scene, this.camera);
    };

    View3D.prototype.clickUpdate = function( colorIndex ) {

        this.scene.remove( this.bgMesh.mesh );

        this.bgMesh.geometry.dispose();
        this.bgMesh.material.dispose();

        this.createMesh(colorIndex);
    };


    //-----------------------
    // Export
    //-----------------------
    win.View3D = View3D;    
    


})(window, document, window.App, jQuery);






(function(win, doc, ns, $) {

    //-----------------------
    // Import
    //-----------------------
    var System = win.Utils;
    var Ticker = win.Ticker;
    var View3D = win.View3D;

    //-----------------------
    // Constant
    //----------------------- 
    var IS_TOUCH = ("ontouchstart" in win) ? true : false;
    var TOUCH_MOVE_EVT = IS_TOUCH ? "touchmove" : "mousemove";
    var TOUCH_END_EVT = IS_TOUCH ? "touchend" : "mouseup";

    var BACKGROUND_SKIN = [
        "rgb(255, 223, 120)",
        "#aeffcc",
        "rgb(132, 188, 255)",
        "#ffc4c4"
    ];

    //-----------------------
    // Main
    //-----------------------
    function Main() {
        
        this.skinIndex = 0;

        this.$container = $("#container");

        this.view3d = new View3D(this.$container);

        this.setup();
    }

    Main.prototype.setup = function() {

        doc.addEventListener(TOUCH_END_EVT, this.clickHandler.bind(this));

        this.setUpdate();
        this.view3d.start();

        this.backgroundChange(0);
    };

    Main.prototype.setUpdate = function() {
        this.ticker = new Ticker( false );
        this.ticker.setFPS(30);
        this.ticker.addListener(this.update.bind(this));
    };

    Main.prototype.update = function( evt ) {

        this.view3d.update(evt);
    };

    Main.prototype.clickHandler = function( evt ) {

        this.skinIndex += 1;
        if( this.skinIndex > 3 ) this.skinIndex = 0;

        this.view3d.clickUpdate(this.skinIndex);
        this.backgroundChange(this.skinIndex);
    };

    Main.prototype.backgroundChange = function( i ) {
        this.$container.css("background-color", BACKGROUND_SKIN[i]);
    };

    //-----------------------
    // Export
    //-----------------------
    $(win).on("load", function() {

        new Main(); 
    });


})(window, document, window.App, jQuery);


