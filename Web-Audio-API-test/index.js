(function (win, doc) {

    var FPS = 30;

    function Visualizer ( audio_url ) {

        this.audio_url = audio_url;

        this.init();
    }

    Visualizer.prototype.init = function () {

        this.audio = new Audio();
        this.context = new ( win.AudioContext || win.webkitAudioContext )();
        this.analyser = this.context.createAnalyser();

        this.canvas = doc.getElementById("c");
        this.c_context = this.canvas.getContext("2d");

        this.canvas.width = this.canvas_w = win.innerWidth
        this.canvas.height = this.canvas_h = win.innerHeight

        var _this = this;

        if( this.audio_url ) {

            this.audio.src = this.audio_url;

            this.source = this.context.createMediaElementSource( this.audio );
        }
        else {

            navigator.webkitGetUserMedia({ audio : true }, function ( stream ) {

                _this.source = _this.context.createMediaStreamSource( stream );

                _this.play();

            }, function () {

                console.log("error");
            });
        }

        // this.set_filter();
    };

    Visualizer.prototype.set_filter = function () {

        this.filter = this.context.createBiquadFilter();
        this.filter.type = 0;
        this.filter.frequency.value = 440;

        this.source.connect( this.filter );

        this.filter.connect( this.analyser ); 
    };

    Visualizer.prototype.play = function () {

        this.source.connect( this.analyser );
        this.analyser.connect( this.context.destination );
        this.audio.play();

        this.setup_update();
    };

    Visualizer.prototype.setup_update = function () {

        var _this = this;

        setInterval(function() {

            _this.update();

        }, 1000 / FPS);
    };

    Visualizer.prototype.update = function () {

        // var data = new Float32Array( this.analyser.frequencyBinCount );
        // this.analyser.getFloatFrequencyData( data );

        this.c_context.clearRect( 0, 0, this.canvas_w, this.canvas_h );

        this.time_domain_render();
        this.frequency_render();
    };

    Visualizer.prototype.time_domain_render = function () {

        var data = new Uint8Array( this.analyser.frequencyBinCount );

        this.analyser.getByteTimeDomainData(data);

        this.c_context.beginPath();

        for ( var i = 0, max = data.length; i < max; ++i ) {

            var val = data[i];

            var x = i * ( this.canvas_w / 1024 );
            var y = this.canvas_h - val;

            if( i == 0 ) {

                this.c_context.moveTo(x,y);
            }
            else {

                this.c_context.lineTo(x,y);
            }
        }

        this.c_context.strokeStyle = "red";
        this.c_context.stroke();
    };

    Visualizer.prototype.frequency_render = function () {

        var data = new Uint8Array( this.analyser.frequencyBinCount );

        this.analyser.getByteFrequencyData( data );

        this.c_context.beginPath();

        for ( var i = 0, max = data.length; i < max; ++i ) {

            var val = data[i];

            var x = i * ( this.canvas_w / 1024 );
            var y = this.canvas_h - val;

            if( i == 0 ) {

                this.c_context.moveTo(x,y);
            }
            else {

                this.c_context.lineTo(x,y);
            }
        }

        this.c_context.strokeStyle = "lime";
        this.c_context.stroke();
    };

    function Main () {

        this.init();
    }

    Main.prototype.init = function () {

        this.btn_music = doc.getElementById("btn_music");
        this.btn_mike = doc.getElementById("btn_mike");

        var _this = this;

        this.btn_music.addEventListener("click", function() {

            var visualizer = new Visualizer("http://jsrun.it/assets/b/B/0/0/bB00j.mp3");

            visualizer.play();

            _this.btn_music.style.display = "none";
            _this.btn_mike.style.display = "none";

        }, false);

        this.btn_mike.addEventListener("click", function() {

            var visualizer = new Visualizer();

            _this.btn_music.style.display = "none";
            _this.btn_mike.style.display = "none";

        }, false);
    };

	win.addEventListener( "load", function () {

        new Main();

	}, false);

})(window, document);
