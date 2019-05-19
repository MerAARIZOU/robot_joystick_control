var Joystick	= function(opts)
{

	//init_ros();
	/*opts			= opts			|| {};
	this._container		= opts.container	|| document.body;
	this._strokeStyle	= opts.strokeStyle	|| 'cyan';
	this._stickEl		= opts.stickElement	|| this._buildJoystickStick();
	this._baseEl		= opts.baseElement	|| this._buildJoystickBase();
	this._mouseSupport	= opts.mouseSupport !== undefined ? opts.mouseSupport : false;
	this._stationaryBase	= opts.stationaryBase || false;
	this._baseX		= this._stickX = opts.baseX || 0
	this._baseY		= this._stickY = opts.baseY || 0
	this._limitStickTravel	= opts.limitStickTravel || false
	this._stickRadius	= opts.stickRadius !== undefined ? opts.stickRadius : 100
	this._useCssTransform	= opts.useCssTransform !== undefined ? opts.useCssTransform : false

	this._container.style.position	= "relative"

	this._container.appendChild(this._baseEl)
	this._baseEl.style.position	= "absolute"
	this._baseEl.style.display	= "none"
	this._container.appendChild(this._stickEl)
	this._stickEl.style.position	= "absolute"
	this._stickEl.style.display	= "none"

	this._pressed	= false;
	this._touchIdx	= null;
	
	if(this._stationaryBase === true){
		this._baseEl.style.display	= "";
		this._baseEl.style.left		= (this._baseX - this._baseEl.width /2)+"px";
		this._baseEl.style.top		= (this._baseY - this._baseEl.height/2)+"px";
	}
    
	this._transform	= this._useCssTransform ? this._getTransformProperty() : false;
	this._has3d	= this._check3D();
	
	var __bind	= function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	this._$onTouchStart	= __bind(this._onTouchStart	, this);
	this._$onTouchEnd	= __bind(this._onTouchEnd	, this);
	this._$onTouchMove	= __bind(this._onTouchMove	, this);
	this._container.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
	this._container.addEventListener( 'touchend'	, this._$onTouchEnd	, false );
	this._container.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
	if( this._mouseSupport ){
		this._$onMouseDown	= __bind(this._onMouseDown	, this);
		this._$onMouseUp	= __bind(this._onMouseUp	, this);
		this._$onMouseMove	= __bind(this._onMouseMove	, this);
		this._container.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
		this._container.addEventListener( 'mouseup'	, this._$onMouseUp	, false );
		this._container.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
	}*/

	document.getElementById("rosbridgeHost").value = rosbridgeHost;
document.getElementById("rosbridgePort").value = rosbridgePort;

	var basePadWidth = 300;
	var basePadHeight = 300;

	var baseLayer = new Kinetic.Layer();
	var baseMarkerLayer = new Kinetic.Layer();
	var baseMessageLayer = new Kinetic.Layer();

	// A line for indicating current velocity overlayed on the video
	//var cmdVelMarker = new Kinetic.Line({});

	var baseStage = new Kinetic.Stage({
    	container: "baseContainer",
    	//x: 0,
    	//y: 0,
    	draggable: false,
    	width: basePadWidth,
    	height: basePadHeight
	});

	// The base control trackpad
	var basePad = new Kinetic.Rect({
    	//x: 0,
    	//y: 0,
    	width: basePadWidth,
    	height: basePadHeight,
    	//offset: [0, 0],
    	fill: "#00D2FF",
    	stroke: "black",
    	strokeWidth: 1
	});

	// A vertical line down the middle of the base pad
	var basePadVerticalLine = new Kinetic.Line({
    	points: [basePadWidth/2, 0, basePadWidth/2, basePadHeight],
    	stroke: "black",
    	strokeWidth: 1,
    	listening: false
	});

	// A horizontal line across the middle of the base pad
	var basePadHorizontalLine = new Kinetic.Line({
	    points: [0, basePadHeight/2, basePadWidth, basePadHeight/2],
    	stroke: "black",
	    strokeWidth: 1,
    	listening: false
	});

	// A circular base pad marker to grab onto with the mouse
	var basePadMarker = new Kinetic.Circle({
    	x: basePadWidth/2,
    	y: basePadHeight/2,
    	radius: 40  ,
    	listening: false,
    	fill: "yellow",
    	stroke: "black",
    	strokeWidth: 1
	});

	// Motion control feedback arrow to overlay on the video
	/*var cmdVelMarker = new Kinetic.Line({
    	points: [videoStageWidth/2, videoStageHeight],
    	listening: false,
    	strokeWidth: 20,
    	opacity: 0.4,
    	lineCap: "round",
    	stroke: "#00CC00"
	});*/

	basePad.on("mousedown", function() {
    mouseDown = true;
    baseStage.draw();
});

basePad.on("mousemove touchmove", function() {
    if (! isTouchDevice && ! mouseDown) { return; }
    var mousePos = baseStage.getPointerPosition();
    var x = (mousePos.x - basePad.getX()) - basePadWidth / 2;
    var y = basePadHeight / 2 - (mousePos.y - basePad.getY());
    x /= (basePadWidth / 2);
    y /= (basePadHeight / 2);
    //vx = sign(y) * (Math.pow(2, Math.abs(y)) - 1) * options['maxLinearSpeed'];
    //vz = -sign(x) * (Math.pow(2, Math.abs(x)) - 1) * options['maxAngularSpeed'];
    vx = y * options['maxLinearSpeed'];
    vz = -x * options['maxAngularSpeed'];
    updateBasePadMarker(vx, vz);
//    cmdVelMarkerY = mousePos.y * 4;
//    cmdVelMarker.setPoints([videoStageWidth/2, videoStageHeight, mousePos.x + (videoStageWidth - basePadWidth)/2, cmdVelMarkerY]);
//    if (Math.abs(vz) < options['deadZoneVz']) vz = 0;
    writeMessageById("baseMessages", " vx: " + Math.round(y * 100)/100 + ", vz: " + Math.round(x*100)/100, "green");
    pubCmdVel();
});

basePad.on("touchend mouseup dblclick", function() {
    mouseDown = false;
    stopRobot();
    basePadMarker.setX(basePadWidth/2);
    basePadMarker.setY(basePadHeight/2);
    //cmdVelMarker.setPoints([videoStageWidth/2, videoStageHeight]);
    baseMarkerLayer.drawScene();
    writeMessageById("baseMessages", "Stopping robot");
});

baseLayer.add(basePad);
baseLayer.add(basePadVerticalLine);
baseLayer.add(basePadHorizontalLine);
baseMarkerLayer.add(basePadMarker)

baseStage.add(baseLayer);
baseStage.add(baseMarkerLayer);
baseStage.add(baseMessageLayer);

function updateBasePadMarker(vx, vz) {
    markerX = vz / options['maxAngularSpeed'];
    markerY = vx / options['maxLinearSpeed'];
        
    markerX *= basePadWidth / 2;
    markerX = basePad.getX() + basePadWidth / 2 - markerX;
    markerY *= basePadHeight / 2;
    markerY = basePad.getY() + basePadHeight / 2 - markerY;
    
    basePadMarker.setX(markerX);
    basePadMarker.setY(markerY);
    baseMarkerLayer.draw();
    writeMessageById("baseMessages", " vx: " + Math.round(vx * 100)/100 + ", vz: " + Math.round(vz*100)/100);
}

function writeMessageById(id, message, color) {
    color = typeof color !== 'undefined' ? color: "#006600";
    element = document.getElementById(id);
    element.innerHTML = message;
    element.style.font = "18pt Calibri";
    element.style.color = color;
}
}