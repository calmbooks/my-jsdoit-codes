/*--------------------
TODO
- 余白もたせる
- 回転試す
---------------------*/

(function(win, doc) {

    //-----------------------
    // Construct
    //-----------------------
	var DEBUG = false;
    var FPS = 6;

    var IMAGE_PATH_ARR = [
        "http://jsrun.it/assets/e/j/K/3/ejK3q.png",
        "http://jsrun.it/assets/l/O/P/e/lOPeu.png",
        "http://jsrun.it/assets/t/m/r/V/tmrVW.png"
    ];

    //-----------------------
    // Utils
    //-----------------------
    function clamp( min, max ) {
        return Math.random() * ( max - min ) + min
    }


    //-----------------------
    // PikuFrame
    //-----------------------
    function PikuFrame( image ) {

        this.image = image;
        this.move = 4;

        this.width = this.image.width;
        this.height = this.image.height;

        this.setup();
    }

    PikuFrame.prototype.HORIZONTAL_N = 3;
    PikuFrame.prototype.VERTICAL_N   = 4;

    PikuFrame.prototype.MOVE_MAX = 3;
    PikuFrame.prototype.PUT_MAX  = 2;

	PikuFrame.prototype.setup = function() {

        this.cvs = doc.createElement("canvas");
        this.ctx = this.cvs.getContext("2d");

        this.cvs.width  = this.width;
        this.cvs.height = this.height;

        this.setTexturePoints();
        this.setTextureFaces();

        // this.moveRotate = clamp(-2,2);

        var movePoints = this.getMovePoints(this.points, this.MOVE_MAX);

        var putPoints1 = this.getMovePoints(movePoints, this.PUT_MAX);
        var putPoints2 = this.getMovePoints(movePoints, this.PUT_MAX);

        this.draw(movePoints);
        this.draw(putPoints1);
        this.draw(putPoints2);
    };

	PikuFrame.prototype.setTexturePoints = function() {

        var points = new Array();

        var split_w = this.width / this.HORIZONTAL_N;
        var split_h = this.height / this.VERTICAL_N;

        for( var y = 0, y_max = this.VERTICAL_N; y <= y_max; ++y ) {

            for( var x = 0, x_max = this.HORIZONTAL_N; x <= x_max; ++x ) {

                points.push({

                    x : split_w * x,
                    y : split_h * y
                });
            } 
        }

        this.points = points;

        return this.points;
    };

	PikuFrame.prototype.setTextureFaces = function() {

        var faces = new Array();

        var point_x_n = this.HORIZONTAL_N + 1;

        for( var row = 0, row_max = this.VERTICAL_N; row < row_max; ++row ) {

            for( var col = 0, col_max = this.HORIZONTAL_N; col < col_max; ++col ) {

                var p0 = ( row * point_x_n ) + col;
                var p1 = p0 + 1;
                var p2 = p0 + point_x_n;
                var p3 = p2 + 1;

                faces.push( [ p0, p1, p2 ] );
                faces.push( [ p1, p2, p3 ] );
            } 
        }

        this.faces = faces;

        return this.faces;
    };

	PikuFrame.prototype.getMovePoints = function( points, move ) {

        var movePoints = new Array();

        for( var i = 0, max = points.length; i < max; ++i ) {

            var point = points[i];

            movePoints.push({

                x : point.x + clamp( -move, move),
                y : point.y + clamp( -move, move)
            });
        }

        return movePoints;
    };

	PikuFrame.prototype.draw = function( points ) {

        // this.cvs.style.webkitTransform = "rotate(" + this.move_rotate_arr[ this.count ] + "deg)";

        for( var i = 0, max = this.faces.length; i < max; ++i ) {

            var face = this.faces[ i ];

            var x_i = ( i % ( this.HORIZONTAL_N * 2 ) ) / 2 | 0;
            var y_i = ( i / ( this.HORIZONTAL_N * 2 ) ) | 0;

            var p0 = points[ face[0] ];
            var p1 = points[ face[1] ];
            var p2 = points[ face[2] ];

            this.ctx.save();

            this.ctx.beginPath();

            this.ctx.moveTo( p0.x, p0.y );
            this.ctx.lineTo( p1.x, p1.y );
            this.ctx.lineTo( p2.x, p2.y );

            this.ctx.closePath();

            this.ctx.clip();
            
            if( i % 2 == 0 ) { // 上

                var dx = p0.x;
                var dy = p0.y;

                var m11 = ( p1.x - p0.x ) / this.width;
                var m12 = ( p1.y - p0.y ) / this.width;
                var m21 = ( p2.x - p0.x ) / this.height;
                var m22 = ( p2.y - p0.y ) / this.height;

                var x = -this.width * x_i;
                var y = -this.height * y_i;
                var w = this.width * this.HORIZONTAL_N;
                var h = this.height * this.VERTICAL_N;
            }
            else { // 下

                var dx = p1.x;
                var dy = p1.y;

                var m11 = ( p2.x - p1.x ) / this.width;
                var m12 = ( p2.y - p1.y ) / this.width;
                var m21 = ( p2.x - p0.x ) / this.height;
                var m22 = ( p2.y - p0.y ) / this.height;

                var x = -this.width * x_i;
                var y = -this.height * ( y_i + 1 );
                var w = this.width * this.HORIZONTAL_N;
                var h = this.height * this.VERTICAL_N;
            }

            this.ctx.setTransform( m11, m12, m21, m22, dx, dy );

            this.ctx.drawImage( this.image, x, y, w, h );

            this.ctx.restore();

            if( DEBUG ) {

                this.ctx.strokeStyle = "red";
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    };

	PikuFrame.prototype.getCanvas = function() {
        return this.cvs;
    };

    //-----------------------
    // PikuPikuAnimation
    //-----------------------
    function PikuPikuAnimation( canvas, image, frameNum, playFrameNum, waitFrameNum ) {

        this.image = image;
        this.frameNum = frameNum;

        this.playFrameNum = playFrameNum;
        this.waitFrameNum = waitFrameNum;

        this.cvs = canvas;
        this.ctx = canvas.getContext("2d");

        this.width  = canvas.width  = image.width;
        this.height = canvas.height = image.height;

        this.frames = [];
        this.frameCount = 0;
        this.playCount = 0;

        this.setup();
    }

    PikuPikuAnimation.prototype.setup = function() {

        this.cvs.style.width = ( this.width / 2 ) + "px";
        this.cvs.style.height = ( this.height / 2 ) + "px";

        this.createFrames();
        this.startUpdate();
    };

    PikuPikuAnimation.prototype.createFrames = function() {
        for( var i = 0, max = this.frameNum; i < max; ++i ) {
            this.frames.push(new PikuFrame(this.image));
        }
    };

	PikuPikuAnimation.prototype.startUpdate = function() {
        setInterval(this.update.bind(this), 1000 / FPS);
    };

	PikuPikuAnimation.prototype.update = function() {

        this.ctx.clearRect(0, 0, this.width, this.height);

        var num = this.playCount % ( this.playFrameNum + this.waitFrameNum );

        if( num < this.playFrameNum ) {
            this.frameDraw();
        }
        else {
            this.imageDraw();
        }

        this.playCount += 1;
    };

	PikuPikuAnimation.prototype.imageDraw = function() {

        this.ctx.drawImage(this.image, 0, 0);
    };

	PikuPikuAnimation.prototype.frameDraw = function() {

        var index = this.frameCount % this.frameNum;

        this.ctx.drawImage(this.frames[index].getCanvas(), 0, 0);

        this.frameCount += 1;
    };

    //-----------------------
    // Main
    //-----------------------
    function Main() {

        this.setup();
    }

    Main.prototype.setup = function() {

        var imagePath = IMAGE_PATH_ARR[ Math.random() * IMAGE_PATH_ARR.length | 0 ];

        var image = new Image();
        var canvas = doc.getElementById("c");

        image.addEventListener("load", function() {
            new PikuPikuAnimation(canvas, image, 3, 3*4, 3*10);
        });

        image.src = imagePath;
    };

    //-----------------------
    // Init
    //-----------------------
	win.addEventListener("load", function() {

        new Main();

	}, false);

})(window, document);
