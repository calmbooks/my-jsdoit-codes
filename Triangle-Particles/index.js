(function(win, doc) {

    //-----------------------
    // Paramater
    //-----------------------    
    var FPS            = 30;
    var QUANTITY_X     = 10;
    var QUANTITY_Y     = 10;
    var AREA_W         = 15000;
    var AREA_H         =  15000;
    var SCALE_X        = [ 5.0, 5.2 ];
    var SCALE_Y        = [ 5.0, 5.2 ];
    var ALPHA          = 0.9;
    var ROTATE_INIT_X  = [ -40,  40 ];
    var ROTATE_INIT_Y  = [ -40,  40 ];
    var ROTATE_INIT_Z  = [   0, 360 ];
    var ROTATE_SPEED_X = 0.001;
    var ROTATE_SPEED_Y = 0.001;
    var ROTATE_SPEED_Z = 0.01;
    var ALPHA_FADE     = [ 0.3, 0.9 ];
    var CAMERA_SPEED   = 5;
    var BLEND_TYPE     = "source-over";
    // var BLEND_TYPE = "lighter";

    var BOOL_MOUSE_MOVE = true;
    var TARGET_MOVE   = [ 0.2, -0.2 ]; // マウスの動きの変化
    var POSITION_MOVE = [ 50,  -50 ]; // マウスの動きの変化

    var COLORS = [
        { r : 255, g :  69, b :  91 },
        { r : 255, g : 88, b : 156 },
        { r : 255, g : 205, b : 80 }
    ];
    
    //-----------------------
    // Construct
    //-----------------------    
    var Global = {};

    var cvs = doc.getElementById("c");
    var ctx = cvs.getContext("2d");

    //-----------------------
    // Main
    //-----------------------    
    function Main() {
        this.init();
    }

    Main.prototype.init = function() {

        this.resize();

        var renderer = new Renderer(this.cvs_w, this.cvs_h);
        var camera   = new Camera(this.cvs_w, this.cvs_h);

        Global.renderer = renderer;
        Global.camera   = camera;

        renderer.set_camera(camera);
  
        for( var x = 0; x < QUANTITY_X; ++x) {
            for( var y = 0; y < QUANTITY_Y; ++y) {
                var tri = new Triangle(x, y);
                renderer.add_object(tri);
            }
        }

        this.set_events();
    };

    Main.prototype.resize = function() {

        this.cvs_w = cvs.width = win.innerWidth;
        this.cvs_h = cvs.height = win.innerHeight;

        cvs.style.margin = "-" + (this.cvs_h/2) + "px 0 0 -" + (this.cvs_w / 2) + "px";
    };

    Main.prototype.set_events = function() {

        var is_touch = "ontouchstart" in win ? true : false;

        if( BOOL_MOUSE_MOVE ) {

            doc.addEventListener( (is_touch ? "touchmove" : "mousemove"), function( event ) {
                event.preventDefault();

                var page_x = is_touch ? event.touches[0].pageX : event.pageX;
                var page_y = is_touch ? event.touches[0].pageY : event.pageY;

                Global.camera.move_change((page_x/this.cvs_w), (page_y/this.cvs_h));

            }.bind(this), false);
        }

        win.addEventListener("resize", function( event ) {
            this.resize();
            Global.renderer.set_render_size(this.cvs_w, this.cvs_h);
            Global.camera.set_display(this.cvs_w, this.cvs_h); 
        }.bind(this), false);
    };

    //-----------------------
    // Object3D
    //-----------------------    
    function Object3D() {

        this.vertexes = new Array();
        this.is_destroy = false;

        this.position = { x : 0, y : 0, z : 0 };
        this.scale    = { x : 1, y : 1, z : 1 };
        this.rotate   = { x : 0, y : 0, z : 0 };
    }

    //-----------------------
    // Triangle
    //-----------------------    
    function Triangle( tile_x, tile_y ) {
        Object3D.apply(this, arguments);

        this.tile_x = tile_x;
        this.tile_y = tile_y;

        var r = 150;

        this.vertexes = [
            new Vertex3D(Math.sin(Utils.dtr(0)) * r, Math.cos(Utils.dtr(0)) * r, 0),
            new Vertex3D(Math.sin(Utils.dtr(120)) * r, Math.cos(Utils.dtr(120)) * r, 0),
            new Vertex3D(Math.sin(Utils.dtr(240)) * r, Math.cos(Utils.dtr(240)) * r, 0)
        ];

        this.set_rotate();

        this.position.z = Utils.range(-10000, 10000);
        this.set_xy_pos();

        this.scale.x = Utils.range(SCALE_X[0], SCALE_X[1]);
        this.scale.y = Utils.range(SCALE_Y[0], SCALE_Y[1]);

        this.color = COLORS[ Math.random() * COLORS.length | 0 ];
    }

    Triangle.prototype = new Object3D();

    /*
    Triangle.prototype.destroy = function() {
        this.is_destroy = true;
    };
    */

    Triangle.prototype.set_xy_pos = function() {
        this.position.x = (AREA_W / (QUANTITY_X - 1)) * this.tile_x - (AREA_W * 0.5);
        this.position.y = (AREA_H / (QUANTITY_Y - 1)) * this.tile_y - (AREA_H * 0.5);
    };

    Triangle.prototype.set_rotate = function() {

        this.rotate = {
            x : Utils.range(ROTATE_INIT_X[0], ROTATE_INIT_X[1]),
            y : Utils.range(ROTATE_INIT_Y[0], ROTATE_INIT_Y[1]),
            z : Utils.range(ROTATE_INIT_Z[0], ROTATE_INIT_Z[1])
        };
    };

    Triangle.prototype.update = function( d ) {

        this.rotate.x += ROTATE_SPEED_X * d;
        this.rotate.y += ROTATE_SPEED_Y * d;
        this.rotate.z += ROTATE_SPEED_Z * d;

        if( Global.camera.position.z - this.position.z < 300  ) {
            this.position.z -= 20000;
            this.set_xy_pos();
            this.set_rotate();
            // this.destroy();
            return;
        }

        this.render();
    };

    Triangle.prototype.render = function() {
 
        var render_object = Affine3Dto2D.get_render_object(this, Global.camera);
        if( render_object == null ) return;

        var alpha = 1;
        var ratio = (Global.camera.position.z - this.position.z) / 20000;

        alpha = ratio > (1 - ALPHA_FADE[0]) ? (1 - ratio) / ALPHA_FADE[0] : alpha;
        alpha = ratio < (1 - ALPHA_FADE[1]) ? ratio / (1 - ALPHA_FADE[1]) : alpha;

        alpha *= ALPHA;

        this.polygon = [];

        var p0 = render_object.display[0];
        var p1 = render_object.display[1];
        var p2 = render_object.display[2];

        var r = this.color.r;
        var g = this.color.g;
        var b = this.color.b;

        ctx.fillStyle = Utils.format("rgba(%s,%s,%s,%s)", r, g, b, alpha); 
        ctx.globalCompositeOperation = BLEND_TYPE;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fill();    
    };

    //-----------------------
    // Camera
    //-----------------------
    function Camera( display_w, display_h ) {
        this.set_display(display_w, display_h);
        this.init();
    }

    Camera.prototype.FIRST_POSITION = 10000;

    Camera.prototype.zoom = 1;

    Camera.prototype.near = 100;
    Camera.prototype.far = 30000;

    // カメラからのベクトル
    Camera.prototype.target = { x : 0, y : 0, z : -1 };
    Camera.prototype.n_target = { x : 0, y : 0, z : -1 };

    Camera.prototype.init = function() {

        this.phi_direction = 1;

        this.position = {
            x : 0,
            y : 0,
            z : this.FIRST_POSITION
        };

        this.n_position = {
            x : 0,
            y : 0,
            z : this.FIRST_POSITION
        };

        this.set_top(Math.PI / 2);
        this.set_value();
    };

    Camera.prototype.set_display = function( display_w, display_h ) {
        this.display_w = display_w;
        this.display_h = display_h;
        this.aspect = this.display_h / this.display_w;

        this.display = {
            x : this.display_w * 0.5,
            y : this.display_h * 0.5
        };
    };

    Camera.prototype.set_top = function( angle ) {

        this.top = {

            angle : angle,
            x : Math.cos(angle),
            y : Math.sin(angle),
            z : 0
        }
    };

    Camera.prototype.set_value = function() {

        (function() { // axis_z

            var x = this.target.x;
            var y = this.target.y;
            var z = this.target.z;

            var l = Math.sqrt(( x * x ) + ( y * y ) + ( z * z ));

            this.view_axis_z = new Vector3D(( x / l ), ( y / l ), ( z / l ));

        }.bind(this))();

        (function() { // axis_x

            var a1 = this.top.x;
            var a2 = this.top.y;
            var a3 = this.top.z;

            var b1 = this.view_axis_z.x;
            var b2 = this.view_axis_z.y;
            var b3 = this.view_axis_z.z;

            var x = ( a2 * b3 ) - ( a3 * b2 );
            var y = ( a3 * b1 ) - ( a1 * b3 );
            var z = ( a1 * b2 ) - ( a2 * b1 );

            var l = Math.sqrt(( x * x ) + ( y * y ) + ( z * z ));

            this.view_axis_x = new Vector3D(( x / l ), ( y / l ), ( z / l ));

        }.bind(this))();

        (function() { // axis_y

            var a1 = this.view_axis_z.x;
            var a2 = this.view_axis_z.y;
            var a3 = this.view_axis_z.z;

            var b1 = this.view_axis_x.x;
            var b2 = this.view_axis_x.y;
            var b3 = this.view_axis_x.z;

            var x = ( a2 * b3 ) - ( a3 * b2 );
            var y = ( a3 * b1 ) - ( a1 * b3 );
            var z = ( a1 * b2 ) - ( a2 * b1 );

            var l = Math.sqrt( ( x * x ) + ( y * y ) + ( z * z ) );

            this.view_axis_y = new Vector3D( ( x / l ), ( y / l ), ( z / l ) );

        }.bind(this))();

        this.view_px = ( this.position.x * this.view_axis_x.x ) + ( this.position.y * this.view_axis_x.y ) + ( this.position.z * this.view_axis_x.z );
        this.view_py = ( this.position.x * this.view_axis_y.x ) + ( this.position.y * this.view_axis_y.y ) + ( this.position.z * this.view_axis_y.z );
        this.view_pz = ( this.position.x * this.view_axis_z.x ) + ( this.position.y * this.view_axis_z.y ) + ( this.position.z * this.view_axis_z.z );

        this.projection_angle_x = Math.atan(( this.display_w * 0.5 ) / this.near);
        this.projection_angle_y = Math.atan(( this.display_h * 0.5 ) / this.near);
    };

    Camera.prototype.update = function( d ) {

        this.position.z -= CAMERA_SPEED * d;

        this.target.x = Utils.mix(this.target.x, this.n_target.x, 0.05);
        this.target.y = Utils.mix(this.target.y, this.n_target.y, 0.05);

        this.position.x = Utils.mix(this.position.x, this.n_position.x, 0.05);
        this.position.y = Utils.mix(this.position.y, this.n_position.y, 0.05);

        this.set_value();
    };

    Camera.prototype.move_change = function( ratio_x, ratio_y ) {

        this.n_target.x = Utils.mix(TARGET_MOVE[0], TARGET_MOVE[1], ratio_x);
        this.n_target.y = Utils.mix(TARGET_MOVE[0], TARGET_MOVE[1], ratio_y);

        this.n_position.x = Utils.mix(POSITION_MOVE[0], POSITION_MOVE[1], ratio_x);
        this.n_position.y = Utils.mix(POSITION_MOVE[0], POSITION_MOVE[1], ratio_y);
    };


    //-----------------------
    // Vertex3D
    //-----------------------
    function Vertex3D( x, y, z ) {

        this.x = x;
        this.y = y;
        this.z = z;
    }

    //-----------------------
    // Vector3D
    //-----------------------
    function Vector3D( x, y, z ) {

        this.x = x;
        this.y = y;
        this.z = z;
    }

    //-----------------------
    // Renderer
    //-----------------------
    function Renderer( render_w, render_h ) {
        this.set_render_size(render_w, render_h);
        this.init();
    }

    Renderer.prototype.now = ( win.performance && ( performance.now || performance.mozNow || performance.webkitNow ) ) || Date.now;

    Renderer.prototype.objects = new Array();

    Renderer.prototype.init = function() {
        this.setup_update();
    };

    Renderer.prototype.set_render_size = function( render_w, render_h ) {
        this.render_w = render_w;
        this.render_h = render_h;

        for( var i = 0, imax = this.objects.length; i < imax; ++i ) {
            this.objects[i].set_xy_pos(); 
        }
    };

    Renderer.prototype.get_time = function() {
        return this.now.call( win.performance );
    };

    Renderer.prototype.setup_update = function() { 
        this.timeoutID = null;
        this.last_time = this.get_time();
        this.update();
    };

    Renderer.prototype.update = function() {
        if( this.timeoutID != null ) return;

        var now_time = this.get_time();

        this.clear();
        // this.remove_objects(); // destroyフラグのあるものを削除
        this.render(now_time - this.last_time);

        this.timeoutID = setTimeout(function() {
            this.timeoutID = null;
            this.update();
        }.bind(this), (1000 / FPS));

        this.last_time = now_time;
    };

    Renderer.prototype.clear = function() {
        ctx.clearRect( 0, 0, this.render_w, this.render_h );
    };

    Renderer.prototype.render = function( delta ) {
        if( this.objects.length == 0 || !this.camera ) return;

        this.camera.update(delta);

        for( var i = 0, imax = this.objects.length; i < imax; ++i ) {
            var object = this.objects[i]; 
            object.update(delta);
        }
    };

    Renderer.prototype.add_object = function( obj ) {
        this.objects.push(obj);
    };

    /*
    Renderer.prototype.remove_objects = function() {

        var i = 0;

        while( i < this.objects.length ) {
            var object = this.objects[i]; 
            if( object.is_destroy )  {
                delete object;
                this.objects.splice(i,1);
                continue;
            }
            else {
                i++;
            }
        }
    };
    */

    Renderer.prototype.set_camera = function( camera ) {
        this.camera = camera;
    };

    //-----------------------
    // Utils
    //-----------------------
    function Utils() {
        throw "Utils cant be instantiated.";
    }

    Utils.range = function( min, max ) {
        return Math.random() * ( max - min ) + min;
    };

    Utils.clamp = function( val, min, max ) {
        if( val < min ) {
            return min;
        }
        else if( max < val) {
            return max;
        }
        else {
            return val;
        } 
    };

    Utils.mix = function( p1, p2, r ) {
        return ( p2 - p1 ) * r + p1;
    };    

    Utils.central = function( p1, p2 ) {
        return ( p2 - p1 ) * 0.5 + p1;
    };

    Utils.central2d = function( p1, p2 ) {

        return {
            x : ( p2.x - p1.x ) * 0.5 + p1.x,
            y : ( p2.y - p1.y ) * 0.5 + p1.y
        };
    };

    Utils.round = function( num ) {

        return Math.round( num * 10 ) / 10;
    };

    Utils.dtr = function( d ) {

        return d * ( Math.PI / 180 );
    };

    Utils.rtd = function( r ) {

        return r * ( 180 / Math.PI );
    };

    Utils.distance3d = function( dx, dy, dz ) {

        var x2 = Math.pow(dx, 2);
        var y2 = Math.pow(dy, 2);
        var z2 = Math.pow(dz, 2);

        return Math.pow((x2 + y2 + z2), 0.5);
    };

    Utils.format = function( tmpl, args ) {
        var str = tmpl;
        for( var i = 1, max = arguments.length; i < max; ++i ) {
            str = str.replace("%s", arguments[i]);
        }
        return str;
    };

    Utils.easeInOut = function( t ) {
        var _t = 0;

        if( t < 0.5 ) {
            _t = Math.pow(t, 2);
        }
        else {
            _t = 1 - Math.pow((1-t), 2);
        }

        return _t;
    };
    

    //-----------------------
    // Affine3Dto2D
    //-----------------------
    function Affine3Dto2D() {
        throw "Affine3Dto2D cant be instantiated."
    }

    Affine3Dto2D.get_render_object = function( object3d, camera ) {

        var render_object = new Object();

        render_object.world      = this.world(object3d);
        render_object.view       = this.view(object3d, render_object.world, camera);
        render_object.projection = this.projection(render_object.view, camera);
        render_object.display    = this.display(render_object.projection, camera);

        if( !this.bool_camera_clip(render_object, camera) ) return null;
        if( !this.bool_camera_front(render_object) ) return null;
        if( !this.bool_camera_display(render_object, camera) ) return null;

        return render_object;
    };

    Affine3Dto2D.bool_camera_clip = function( render_object, camera ) {

        var returnBool = false;

        // near far の範囲内か
        for( var i = 0, imax = render_object.view.length; i < imax; ++i ) {
            var view = render_object.view[i]; 
            if( Utils.distance3d(view.x, view.y, view.z) > camera.near ) {
                if( Utils.distance3d(view.x, view.y, view.z) < camera.far ) {
                    returnBool = true;
                }
            }
        }

        return returnBool;
    };

    Affine3Dto2D.bool_camera_front = function( render_object ) {

        var returnBool = false;

        // カメラの裏側にあるか否か
        for( var i = 0, imax = render_object.view.length; i < imax; ++i ) {
            var view = render_object.view[i]; 
            if( view.z >= 0) {
                returnBool = true;
            }
        }

        return returnBool;
    }; 

    Affine3Dto2D.bool_camera_display = function( render_object, camera ) {

        var returnBool = false;

        // ディスプレイに表示される範囲内か
        for( var i = 0, imax = render_object.display.length; i < imax; ++i ) {
            var display = render_object.display[i]; 
            if( 0 <= display.x && display.x <= camera.display_w ) {
                if( 0 <= display.y && display.y <= camera.display_h ) {
                    returnBool = true;
                }
            }
        }

        return returnBool;
    }; 

    Affine3Dto2D.world = function( object3d ) {

        var arr = new Array();

        for( var i = 0, imax = object3d.vertexes.length; i < imax; ++i ) {
            var vertex = object3d.vertexes[i]; 

            var obj = { 
                x : vertex.x,
                y : vertex.y,
                z : vertex.z
            };

            (function() { // scale

                obj.x *= object3d.scale.x;
                obj.y *= object3d.scale.y;
                obj.z *= object3d.scale.z;
            }());

            (function() { // rotate x

                var radian_x = Utils.dtr(object3d.rotate.x);

                var y = ( obj.y * Math.cos(radian_x) ) - ( obj.z * Math.sin(radian_x) );
                var z = ( obj.y * Math.sin(radian_x) ) + ( obj.z * Math.cos(radian_x) );

                obj.y = y;
                obj.z = z;
            }());

            (function() { // rotate y

                var radian_y = Utils.dtr(object3d.rotate.y);

                var x = ( obj.x * Math.cos(radian_y) ) + ( obj.z * Math.sin(radian_y) );
                var z = ( obj.x * -1 * Math.sin(radian_y) ) + ( obj.z * Math.cos(radian_y) );

                obj.x = x;
                obj.z = z;
            }());

            (function() { // rotate z

                var radian_z = Utils.dtr(object3d.rotate.z);

                var x = ( obj.x * Math.cos(radian_z) ) - ( obj.y * Math.sin(radian_z) );
                var y = ( obj.x * Math.sin(radian_z) ) + ( obj.y * Math.cos(radian_z) );

                obj.x = x;
                obj.y = y;
            }());

            (function() { // position z

                obj.x += object3d.position.x;
                obj.y += object3d.position.y;
                obj.z += object3d.position.z;
            }());

            arr.push(obj);
        }

        return arr;
    };

    Affine3Dto2D.view = function( object3d, world, camera ) {

        var arr = new Array();

        for( var i = 0, imax = world.length; i < imax; ++i ) {
            var vertex = world[i]; 

            var obj = {
                x : vertex.x,
                y : vertex.y,
                z : vertex.z
            };

            var x = ( obj.x * camera.view_axis_x.x ) + ( obj.y * camera.view_axis_x.y ) + ( obj.z * camera.view_axis_x.z ) - camera.view_px;
            var y = ( obj.x * camera.view_axis_y.x ) + ( obj.y * camera.view_axis_y.y ) + ( obj.z * camera.view_axis_y.z ) - camera.view_py;
            var z = ( obj.x * camera.view_axis_z.x ) + ( obj.y * camera.view_axis_z.y ) + ( obj.z * camera.view_axis_z.z ) - camera.view_pz;

            obj.x = x;
            obj.y = y;
            obj.z = z;

            arr.push(obj);
        }

        return arr;
    };

    Affine3Dto2D.projection = function( view, camera ) {

        var arr = new Array();

        for( var i = 0, imax = view.length; i < imax; ++i ) {
            var vertex = view[i]; 

            arr.push({

                x : (vertex.x / (Math.tan(camera.projection_angle_x * 0.5) * (vertex.z * -1))) * camera.display.x * camera.zoom,
                y : (vertex.y / (Math.tan(camera.projection_angle_y * 0.5) * (vertex.z * -1))) * camera.display.y * camera.zoom,
                d : vertex.z * -1 / camera.far
            });
        }

        return arr;
    };

    Affine3Dto2D.display = function( projection, camera ) {

        var arr = new Array();

        for( var i = 0, imax = projection.length; i < imax; ++i ) {
            var vertex = projection[i]; 

            arr.push({
                x : (vertex.x * Math.pow(camera.aspect, 0.5) + camera.display.x),
                // x : (vertex.x + camera.display.x),
                y : (( vertex.y * -1 ) + camera.display.y)
            });
        }

        return arr;
    };

    //-----------------------
    // Entry point
    //-----------------------    
    win.addEventListener("load", function() {
        new Main();
    }, false);

})(window, document);
    

