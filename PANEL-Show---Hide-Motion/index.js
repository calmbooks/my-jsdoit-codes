(function(win, doc, ns, $) {

    //-----------------------
    // Import
    //-----------------------
    var System = win.Utils;

    //-----------------------
    // Constant
    //-----------------------
    var LINE_COLOR = new THREE.Color(62/255,148/255,226/255);

    var SIZE = 204;

    var SHOW_DURATION = 2000;
    var HIDE_DURATION = 1000;

    var POINTS = [
        [ 1.0, 0.0, 0.0 ],
        [ 0.0, 1.0, 0.0 ],
        [ -1.0, 0.0, 0.0 ],
        [ 0.0, -1.0, 0.0 ]
    ];

    var NORMALS = [
        [ 0.0, 0.0, 1.0 ],
        [ 0.0, 0.0, 1.0 ],
        [ 0.0, 0.0, 1.0 ],
        [ 0.0, 0.0, 1.0 ]
    ];

    var FACES = [
        [ 0, 1, 2 ],
        [ 0, 2, 3 ]
    ];

    //-----------------------
    // KeyFactorPanel
    //-----------------------
    function KeyFactorPanel( device, position, i ) {

        this.device = device;
        this.position = position;
        this.index = i;

        this.isAnimate = false;

        this.isBeforeShow = false;
        this.isShow = false;

        this.size = SIZE;

        this.$dom = $("#blockPanelsCanvas .listPanels li").eq(i);


        this.animateCountTime = 0;
        this.animateDurationTime = 0;
        this.animateTimeRatio = 0;

        this.setup();
    }

    KeyFactorPanel.prototype.setup = function() {

        this.mesh = this.createMesh();
        this.line = this.createLineSegments();

        this.mesh.visible = false; 
        this.line.visible = false;

        this.group = new THREE.Group();
        this.group.add( this.mesh );
        this.group.add( this.line );

        this.group.position.x = this.position.x;
        this.group.position.y = this.position.y;

        this.$dom.removeClass("show").addClass("hide");
    };

    KeyFactorPanel.prototype.createLineSegments = function() {

        this.lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            transparent: true,
            opacity : 1.0,
            linecap: "round",
            linejoin:  "round"
        });

        var linePointCount = POINTS.length * 2; 

        this.linePointPositions = new Float32Array(linePointCount * 3);
        this.linePointColors = new Float32Array(linePointCount * 3);

        var posi = 0;
        var coli = 0;
        var rani = 0;

        for( var i = 0, imax = POINTS.length; i < imax; ++i ) {

            var n = i + 1;
            n = n > 3 ? 0 : n;

            this.linePointPositions[ posi++ ] = POINTS[i][0] * this.size * 0.5;
            this.linePointPositions[ posi++ ] = POINTS[i][1] * this.size * 0.5;
            this.linePointPositions[ posi++ ] = POINTS[i][2] * this.size * 0.5;

            this.linePointPositions[ posi++ ] = POINTS[n][0] * this.size * 0.5;
            this.linePointPositions[ posi++ ] = POINTS[n][1] * this.size * 0.5;
            this.linePointPositions[ posi++ ] = POINTS[n][2] * this.size * 0.5;

            this.linePointColors[ coli++ ] = LINE_COLOR.r;
            this.linePointColors[ coli++ ] = LINE_COLOR.g;
            this.linePointColors[ coli++ ] = LINE_COLOR.b;

            this.linePointColors[ coli++ ] = LINE_COLOR.r;
            this.linePointColors[ coli++ ] = LINE_COLOR.g;
            this.linePointColors[ coli++ ] = LINE_COLOR.b;
        }

        this.lineGeometry = new THREE.BufferGeometry();

        this.lineGeometry.addAttribute("position", new THREE.BufferAttribute( this.linePointPositions, 3 ).setDynamic( true ));
        this.lineGeometry.addAttribute("color", new THREE.BufferAttribute( this.linePointColors, 3 ).setDynamic( true ));

        return new THREE.LineSegments( this.lineGeometry, this.lineMaterial );
    };

    KeyFactorPanel.prototype.createMesh = function() {

        this.meshMaterial = new THREE.MeshLambertMaterial({
            color: 0x999999,
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors,
            transparent: true,
            opacity: 0.0
        });

        var faceCount = FACES.length;
        var arrCount = faceCount * 3 * 3;

        this.meshPositions = new Float32Array(arrCount);
        this.meshColors = new Float32Array(arrCount);
        this.meshNormals = new Float32Array(arrCount);

        var posi = 0;
        var coli = 0;
        var nori = 0;

        for( var i = 0, imax = FACES.length; i < imax; ++i ) {

            var i0 = FACES[i][0];
            var i1 = FACES[i][1];
            var i2 = FACES[i][2];

            var k = 0.49;

            this.meshPositions[ posi++ ] = POINTS[i0][0] * this.size * k;
            this.meshPositions[ posi++ ] = POINTS[i0][1] * this.size * k;
            this.meshPositions[ posi++ ] = POINTS[i0][2] * this.size * k;

            this.meshPositions[ posi++ ] = POINTS[i1][0] * this.size * k;
            this.meshPositions[ posi++ ] = POINTS[i1][1] * this.size * k;
            this.meshPositions[ posi++ ] = POINTS[i1][2] * this.size * k;

            this.meshPositions[ posi++ ] = POINTS[i2][0] * this.size * k;
            this.meshPositions[ posi++ ] = POINTS[i2][1] * this.size * k;
            this.meshPositions[ posi++ ] = POINTS[i2][2] * this.size * k;

            this.meshColors[ coli++ ] = 1.0;
            this.meshColors[ coli++ ] = 1.0;
            this.meshColors[ coli++ ] = 1.0;

            this.meshColors[ coli++ ] = 1.0;
            this.meshColors[ coli++ ] = 1.0;
            this.meshColors[ coli++ ] = 1.0;

            this.meshColors[ coli++ ] = 1.0;
            this.meshColors[ coli++ ] = 1.0;
            this.meshColors[ coli++ ] = 1.0;

            this.meshNormals[ nori++ ] = NORMALS[i0][0];
            this.meshNormals[ nori++ ] = NORMALS[i0][1];
            this.meshNormals[ nori++ ] = NORMALS[i0][2];

            this.meshNormals[ nori++ ] = NORMALS[i1][0];
            this.meshNormals[ nori++ ] = NORMALS[i1][1];
            this.meshNormals[ nori++ ] = NORMALS[i1][2];

            this.meshNormals[ nori++ ] = NORMALS[i2][0];
            this.meshNormals[ nori++ ] = NORMALS[i2][1];
            this.meshNormals[ nori++ ] = NORMALS[i2][2];
        }

        this.geometry = new THREE.BufferGeometry();

        this.geometry.addAttribute("position", new THREE.BufferAttribute( this.meshPositions, 3 ).setDynamic( true ));
        this.geometry.addAttribute("color", new THREE.BufferAttribute( this.meshColors, 3 ).setDynamic( true ));
        this.geometry.addAttribute("normal", new THREE.BufferAttribute( this.meshNormals, 3 ).setDynamic( true ));

        return new THREE.Mesh( this.geometry, this.meshMaterial );
    };

    KeyFactorPanel.prototype.toggle = function() {

        if( !this.isShow ) {

            this.isShow = true; 
            this.$dom.removeClass("hide").addClass("show");            
        }
        else {

            this.isShow = false; 
            this.$dom.removeClass("show").addClass("hide");            
        }

        if( this.isShow != this.isBeforeShow ) {

            if( this.isShow ) {
                this.animateShow();
            }
            else {
                this.animateHide();
            }
        }

        this.isBeforeShow = this.isShow;
    };

    KeyFactorPanel.prototype.animateShow = function() {
        this.isAnimate = true;
        this.animateDurationTime = SHOW_DURATION;

        this.animateCountTime = this.animateDurationTime * this.animateTimeRatio;

    };

    KeyFactorPanel.prototype.animateHide = function() {
        this.isAnimate = true;
        this.animateDurationTime = HIDE_DURATION;

        this.animateCountTime = this.animateDurationTime *  (1 - this.animateTimeRatio);
    };

    KeyFactorPanel.prototype.animateEnd = function() {
        this.isAnimate = false;
    };

    KeyFactorPanel.prototype.update = function( evt ) {

        if( this.isAnimate ) {

            this.animateCountTime += evt.delta;

            this.animateTimeRatio = this.animateCountTime / this.animateDurationTime;
            this.animateTimeRatio = this.isShow ? this.animateTimeRatio : 1 - this.animateTimeRatio;
            this.animateTimeRatio = System.clamp(this.animateTimeRatio,0,1);

            if( this.isShow ) {

                var rl = System.ratio(0,0.5,this.animateTimeRatio);
                var rm = System.ratio(0.5,1,this.animateTimeRatio);

                this.animateLine(System.clamp(rl,0,1));
                this.animateMesh(System.clamp(rm,0,1));
            }
            else {
                this.animateLine(this.animateTimeRatio);
                this.animateMesh(this.animateTimeRatio);
            }

            if( this.animateCountTime >= this.animateDurationTime ) {
                this.animateEnd();
            } 
        }
    };

    KeyFactorPanel.prototype.animateMesh = function( t ) {
        if( !this.isAnimate ) return;

        if( t <= 0 ) {
            this.mesh.visible = false;
            return;
        }
        else {
            this.mesh.visible = true;
        }
        
        t = 1-Math.pow(1-t, 3);

        var start = new THREE.Vector3(System.d2r(45),System.d2r(70),0);
        var target =  new THREE.Vector3(0,0,0);

        var mix = System.mix3d(start, target, t);

        this.meshMaterial.opacity = System.mix(0,1,t);
        this.mesh.rotation.set(mix.x, mix.y, mix.z);

    };

    KeyFactorPanel.prototype.animateLine = function( t ) {
        if( !this.isAnimate ) return;

        // if( this.index != 0 )return;
        // console.log(t);

        if( t <= 0 ) {
            this.line.visible = false;
            return;
        }
        else {
            this.line.visible = true;
        }

        t = 1-Math.pow(1-t, 3);


        var posi = 0;
        var coli = 0;
        var rani = 0;

        for( var i = 0, imax = POINTS.length; i < imax; ++i ) {

            var n = i + 1;
            n = n > 3 ? 0 : n;

            var k = this.size * 0.5;

            var start = new THREE.Vector3(POINTS[i][0]*k,POINTS[i][1]*k,POINTS[i][2]*k);
            var target = new THREE.Vector3(POINTS[n][0]*k,POINTS[n][1]*k,POINTS[n][2]*k);

            var mix = System.mix3d(start, target, t);

            this.linePointPositions[ posi++ ] = start.x;
            this.linePointPositions[ posi++ ] = start.y;
            this.linePointPositions[ posi++ ] = start.z;

            this.linePointPositions[ posi++ ] = mix.x;
            this.linePointPositions[ posi++ ] = mix.y;
            this.linePointPositions[ posi++ ] = mix.z;

            // this.linePointColors[ coli++ ] = LINE_COLOR.r;
            // this.linePointColors[ coli++ ] = LINE_COLOR.g;
            // this.linePointColors[ coli++ ] = LINE_COLOR.b;

            // this.linePointColors[ coli++ ] = LINE_COLOR.r;
            // this.linePointColors[ coli++ ] = LINE_COLOR.g;
            // this.linePointColors[ coli++ ] = LINE_COLOR.b;
        }

        this.line.geometry.attributes.position.needsUpdate = true;
        this.line.geometry.attributes.color.needsUpdate = true;
    };


    //-----------------------
    // Export
    //-----------------------
    win.KeyFactorPanel = KeyFactorPanel;    


})(window, document, window.App, jQuery);




(function(win, doc, ns, $) {

    //-----------------------
    // Import
    //-----------------------
    var System = win.Utils;
    var KeyFactorPanel = win.KeyFactorPanel;

    //-----------------------
    // Constant
    //-----------------------

    var VIEW_WIDTH = 1126;
    var VIEW_HEIGHT = 940;


    //-----------------------
    // ViewKeyFactors
    //-----------------------
    function ViewKeyFactors( device ) {

        this.device = device;

        this.$container = $("#blockPanelsCanvas");

        this.viewWidth = VIEW_WIDTH;
        this.viewHeight = VIEW_HEIGHT;

        this.isUpdate = false;

        this.cMouseRatioX = 0.0;
        this.cMouseRatioY = 0.0;

        this.mouseRatioX = 0.0;
        this.mouseRatioY = 0.0;

        this.currentCameraPosition = new THREE.Vector3(0,0,500);
        this.currentCameraTarget = new THREE.Vector3(0.0, 0.0, 0.0);

        this.panels = [];

        this.setup();
    }

    ViewKeyFactors.prototype.setup = function() {

        this.setCamera();
        this.setRenderer();

        this.scene = new THREE.Scene();

        this.light = new THREE.DirectionalLight( 0xffffff, 1.0 );
        this.light.position.set( 0, 0, 10 );
        this.scene.add( this.light );

		this.scene.add( new THREE.AmbientLight( 0xcde3e2 ) );

        this.objGroup = new THREE.Group();

        var d = 113;
        this.createPanel(-d, d, 0);
        this.createPanel(d, d, 1);
        this.createPanel(0, 0, 2);
        this.createPanel(-d, -d, 3);
        this.createPanel(d, -d, 4);

        this.scene.add( this.objGroup );

        this.toggles();
    };

    ViewKeyFactors.prototype.createPanel = function(x, y, i ) {

        var panel = new KeyFactorPanel( this.device, new THREE.Vector2(x, y), i );

        this.objGroup.add( panel.group );

        this.panels.push(panel);
    };

    ViewKeyFactors.prototype.setCamera = function() {
        this.camera = new THREE.OrthographicCamera( this.viewWidth * -0.5, this.viewWidth * 0.5, this.viewHeight * 0.5, this.viewHeight * -0.5, 0.01, 10000 );

        this.camera.position.x = this.currentCameraPosition.x;
        this.camera.position.y = this.currentCameraPosition.y;
        this.camera.position.z = this.currentCameraPosition.z;
        this.camera.lookAt(this.currentCameraTarget);
    };

    ViewKeyFactors.prototype.setRenderer = function() {

        this.renderer = new THREE.WebGLRenderer({
            antialias : true,
            alpha : true
        });

        // this.renderer.setPixelRatio( 1.0 );
        this.renderer.setPixelRatio(window.devicePixelRatio);        
        this.renderer.setSize( this.viewWidth, this.viewHeight );

        this.$container[0].appendChild( this.renderer.domElement );
    };

    ViewKeyFactors.prototype.start = function() {

        this.isUpdate = true;
    };

    ViewKeyFactors.prototype.update = function( evt ) {
        if( !this.isUpdate ) return;

        for( var i = 0, imax = this.panels.length; i < imax; ++i ) {
            this.panels[i].update(evt);
        }

        this.updateMouseMove();
        this.renderer.render(this.scene, this.camera);
    };

    ViewKeyFactors.prototype.updateMouseMove = function() {

        this.cMouseRatioX = System.mix(this.cMouseRatioX, this.mouseRatioX, 0.08);
        this.cMouseRatioY = System.mix(this.cMouseRatioY, this.mouseRatioY, 0.08);

        var z = 1500;

        for( var i = 0, imax = this.panels.length; i < imax; ++i ) {
            this.panels[i].group.lookAt(new THREE.Vector3(this.cMouseRatioX * win.innerWidth, this.cMouseRatioY * -win.innerHeight, z));
        }
    };

    ViewKeyFactors.prototype.mouseMove = function( mouseRatioX, mouseRatioY  ) {

        this.mouseRatioX = mouseRatioX;
        this.mouseRatioY = mouseRatioY;
    };

    ViewKeyFactors.prototype.toggles = function() {

        for( var i = 0, imax = this.panels.length; i < imax; ++i ) {

            (function(_i) {

                setTimeout(function() {
                    this.panels[_i].toggle(); 
                }.bind(this), 300*_i); 

            }.bind(this))(i);
        }
    };

    //-----------------------
    // Export
    //-----------------------
    win.ViewKeyFactors = ViewKeyFactors;    
    


})(window, document, window.App, jQuery);



(function(win, doc, ns, $) {

    //-----------------------
    // Import
    //-----------------------
    var System = win.Utils;
    var Ticker = win.Ticker;
    var ViewKeyFactors = win.ViewKeyFactors;

    //-----------------------
    // Constant
    //----------------------- 
    var IS_TOUCH = ("ontouchstart" in win) ? true : false;
    var TOUCH_MOVE_EVT = IS_TOUCH ? "touchmove" : "mousemove";

    //-----------------------
    // Main
    //-----------------------
    function Main( device ) {
        
        this.viewKeyFactors = new ViewKeyFactors(device);

        this.setup();
    }

    Main.prototype.setup = function() {

        doc.addEventListener(TOUCH_MOVE_EVT, this.mouseMoveHandler.bind(this));
        doc.addEventListener("click", this.clickHandler.bind(this));

        this.setUpdate();
        this.viewKeyFactors.start();
    };

    Main.prototype.setUpdate = function() {
        this.ticker = new Ticker( false );
        this.ticker.setFPS(20);
        this.ticker.addListener(this.update.bind(this));
    };

    Main.prototype.update = function( evt ) {

        this.viewKeyFactors.update(evt);
    };

    Main.prototype.mouseMoveHandler = function( evt ) {

        var pageX = "ontouchmove" in win ? evt.touches[0].clientX | 0 : evt.clientX | 0;
        var pageY = "ontouchmove" in win ? evt.touches[0].clientY | 0 : evt.clientY | 0;

        var _rx = pageX / win.innerWidth - 0.5;
        var _ry = pageY / win.innerHeight - 0.5;

        this.viewKeyFactors.mouseMove(_rx,_ry);
    };

    Main.prototype.clickHandler = function( evt ) {
        this.viewKeyFactors.toggles();
    };

    //-----------------------
    // Export
    //-----------------------
    $(win).on("load", function() {

        new Main(); 
    });


})(window, document, window.App, jQuery);


