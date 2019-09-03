"use strict";

var _extends = function (child, parent) {
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  child.__proto__ = parent;
};

(function (win, doc, THREE) {
  //-----------------------
  // Shader
  //-----------------------   
  var BLUR_VERTEX_SHADER = "\n\n        varying vec2 vUV;\n        void main() {\n            vUV = uv;\n            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        }\n\n    ";

  var BLUR_FRAGMENT_SHADER = "\n\n        uniform sampler2D texture;\n        uniform vec2 renderSize;\n        uniform float blur;\n        uniform int useBlur;\n        varying vec2 vUV;\n\n        vec4 getBlurColor( vec4 destColor ) {\n            const int blurPixel = 10;\n            const int blurW = blurPixel;\n            const int blurH = blurPixel;\n            float maxLevel = float((blurPixel - 1) / 2);\n            float total = 0.0;\n\n            for( int y = 0; y < blurH; ++y ) {\n                for( int x = 0; x < blurW; ++x ) {\n                    if( x != 0 || y != 0 ) {\n                       int addX = x - (blurW - 1) / 2;\n                       int addY = y - (blurH - 1) / 2;\n                       float level = max(abs(float(addX)), abs(float(addY))) - 1.0;\n                       float b = blur * maxLevel - level;\n                       b = clamp(b, 0.0, 1.0);\n                       float surroundX= float(addX) * 3.0 / renderSize.x;\n                       float surroundY = float(addY) * 3.0 / renderSize.y;\n                       destColor += texture2D(texture, (vUV + vec2(surroundX, surroundY))) * b;\n                       total += b;\n                    }\n                }\n            }\n            return destColor / (total + 1.0);\n        }\n\n        void main() {\n            vec4 destColor = vec4(0,0,0,0);\n            destColor += texture2D(texture, vUV);\n            if( useBlur == 1 ) {\n                destColor = getBlurColor(destColor);\n            }\n        \tgl_FragColor = destColor;\n        }\n    ";

  //-----------------------
  // BlurRenderer
  //-----------------------   
  var BlurRenderer = (function (THREE) {
    var BlurRenderer = function BlurRenderer(canvas) {
      THREE.WebGLRenderer.call(this, { antialias: false, canvas: canvas });
      this.setClearColor(2236962, 1);
    };

    _extends(BlurRenderer, THREE.WebGLRenderer);

    BlurRenderer.prototype.setup = function (width, height) {
      this.stageWidth = width;
      this.stageHeight = height;

      this.renderTarget = new THREE.WebGLRenderTarget(this.stageWidth, this.stageHeight);

      this.setSize(this.stageWidth, this.stageHeight);

      this.screenScene = new THREE.Scene();
      this.screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

      this.screenCamera.position.set(0, 0, 0);
      this.screenCamera.lookAt(new THREE.Vector3(0, 0, -1));

      var geo = new THREE.PlaneGeometry(2, 2, 2, 2);

      var uniforms = {
        texture: { type: "t", value: this.renderTarget },
        renderSize: { type: "v2", value: new THREE.Vector2(this.stageWidth, this.stageHeight) },
        blur: { type: "f", value: 0 },
        useBlur: { type: "i", value: 0 }
      };

      var mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: BLUR_VERTEX_SHADER,
        fragmentShader: BLUR_FRAGMENT_SHADER
      });

      this.screenMesh = new THREE.Mesh(geo, mat);
      this.screenMesh.position.set(0, 0, -1);

      this.screenScene.add(this.screenCamera);
      this.screenScene.add(this.screenMesh);
    };

    BlurRenderer.prototype.setBlur = function (val) {
      this.screenMesh.material.uniforms.blur.value = val;
    };

    BlurRenderer.prototype.setUseBlur = function (bool) {
      this.screenMesh.material.uniforms.useBlur.value = bool ? 1 : 0;
    };

    BlurRenderer.prototype.update = function (scene, camera) {
      this.render(scene, camera, this.renderTarget);
      this.render(this.screenScene, this.screenCamera);
    };

    return BlurRenderer;
  })(THREE);

  ;


  //-----------------------
  // Main
  //-----------------------   
  var Main = (function () {
    var Main = function Main() {};

    Main.prototype.setup = function () {
      this.canvas = doc.getElementById("c");

      this.renderer = new BlurRenderer(this.canvas);
      this.renderer.setup(465, 465);
      this.renderer.setUseBlur(true);

      this.scene = new THREE.Scene();

      this.setCamera();
      this.setLight();
      this.setBox();

      this.setRangeEvent();
      this.setUpdate();
    };

    Main.prototype.setCamera = function () {
      this.camera = new THREE.PerspectiveCamera(80, 465 / 465, 0.1, 1000);
      this.camera.position.set(0, 1, 2);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    Main.prototype.setLight = function () {
      this.light = new THREE.PointLight();
      this.light.position.set(0, 1, 2);
      this.ambientLight = new THREE.AmbientLight(2236962);
      this.scene.add(this.light, this.ambientLight);
    };

    Main.prototype.setBox = function () {
      this.boxTexture = THREE.ImageUtils.loadTexture("http://jsrun.it/assets/c/y/E/s/cyEsA.png");
      this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      this.boxMaterial = new THREE.MeshLambertMaterial({ map: this.boxTexture });
      this.boxMesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
      this.scene.add(this.boxMesh);
    };

    Main.prototype.setUpdate = function () {
      this.rotate = 0;
      this.update();
    };

    Main.prototype.update = function () {
      this.rotate += this.d2r(1);
      this.boxMesh.rotation.set(this.rotate, this.rotate, 0);
      this.renderer.update(this.scene, this.camera);
      requestAnimationFrame(this.update.bind(this));
    };

    Main.prototype.d2r = function (val) {
      return val * (Math.PI / 180);
    };

    Main.prototype.setRangeEvent = function () {
      var self = this;
      var range = doc.getElementById("blurRange");

      range.addEventListener("input", function (e) {
        var val = Number(e.target.value);
        self.renderer.setBlur(val / 100);
      });

      this.renderer.setBlur(Number(range.value) / 100);
    };

    return Main;
  })();





  //-----------------------
  // Initialize
  //-----------------------   
  win.addEventListener("load", function () {
    var main = new Main();
    main.setup();
  });

})(window, document, THREE);

