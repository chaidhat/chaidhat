let a, b, c, d, e;

let CANVAS_X = 400;
const CANVAS_Y = 800;
const SCREEN_WIDTH = 400;
let PIXEL_SIZE = 20;

let BRIGHTNESS = 255, wavelength;

const OFFSET = 128;

var canvas = [];
var canvasScreen = [];

let xV = 0;
let yV = CANVAS_Y / 2;

let sliders = [
    {
        "label": "brightness",
        "minVal": 0,
        "maxVal": 2000,
        "defVal": 400,
    },
    {
        "label": "lambda",
        "minVal": 1,
        "maxVal": 10,
        "defVal": 2,
    },
    {
        "label": "d",
        "minVal": 0,
        "maxVal": 100,
        "defVal": 80,
    },
    {
        "label": "D",
        "minVal": 20,
        "maxVal": 40,
        "defVal": 20,
    },
    {
        "label": "b",
        "minVal": 0,
        "maxVal": 50,
        "defVal": 10,
    },
    {
        "label": "num_of_slits",
        "minVal": 0,
        "maxVal": 5,
        "defVal": 2,
    },
];

function slidersInit() {
    for (let i = 0; i < sliders.length; i++) {
        let s = sliders[i];
        s.slider = createSlider(s.minVal, s.maxVal, s.defVal);
        s.slider.position(20, 20 + (30 * i));
        s.val = s.defVal;
    }
}

function slidersCheck() {
    for (let i = 0; i < sliders.length; i++) {
        let s = sliders[i];
        if (s.val !== s.slider.value()) {
            s.val = s.slider.value();
            return true;
        }
    }
    return false;
}
function slidersDraw() {
    fill(color(255,255,255))
    for (let i = 0; i < sliders.length; i++) {
        let s = sliders[i];
        text(s.label, s.slider.x * 2 + s.slider.width, s.slider.y + 10);
    }
}
function slidersGetVal(label) {
    for (let i = 0; i < sliders.length; i++) {
        if (sliders[i].label === label) {
            return sliders[i].slider.value();
        }
    }
}

function setup() {
    createCanvas(800 + SCREEN_WIDTH, CANVAS_Y);
    noStroke();
    textSize(15);

    slidersInit();
    background(0);
}

var start = true;
var timeSinceActivity = 0;
var lastUpdate = Date.now();
function draw() {
    var now = Date.now();
    var dt = now - lastUpdate;
    timeSinceActivity = dt;
    //console.log(timeSinceActivity)

    // draw sliders
    slidersDraw();

    // check if sliders changed
    if (slidersCheck() || start) {
        wavelength = slidersGetVal("lambda");
        BRIGHTNESS = slidersGetVal("brightness");
        CANVAS_X = slidersGetVal("D") * 20;
        PIXEL_SIZE = 10;
        start = false;
        simulateWaves();
        renderWaves();
        lastUpdate = Date.now();
        timeSinceActivity = 0;
    }
    if (timeSinceActivity > 1000 && PIXEL_SIZE !== 2) {
        PIXEL_SIZE = 2;
        simulateWaves();    // don't simulate screen
        renderWaves();
        PIXEL_SIZE = 4;
        simulateScreen();
        renderScreen();
        PIXEL_SIZE = 2;
    }
}

function simulateWaves() {
    // init canvas data
    for (let x = 0; x < CANVAS_X / PIXEL_SIZE; x++) {
        canvas[x] = [];
        for (let y = 0; y < CANVAS_Y / PIXEL_SIZE; y++) {
            canvas[x][y] = [0, 0, 0]
        }
    }
    simulate(0);
}

function simulateScreen() {
    // init canvas screen data
    for (let y = 0; y < CANVAS_Y / PIXEL_SIZE; y++) {
        canvasScreen[y] = [0, 0, 0];
    }
    for (let lambdaOffset = 0; lambdaOffset < 30; lambdaOffset++) {
        // init canvas data
        for (let x = 0; x < CANVAS_X / PIXEL_SIZE; x++) {
            canvas[x] = [];
            for (let y = 0; y < CANVAS_Y / PIXEL_SIZE; y++) {
                canvas[x][y] = [0, 0, 0]
            }
        }
        simulate(lambdaOffset / 30);
        for (let y = 0; y < CANVAS_Y / PIXEL_SIZE; y++) {
            let val = canvas[(CANVAS_X / PIXEL_SIZE) - 1][y];
            if (canvasScreen[y][0] < Math.abs(val[0])) {
                canvasScreen[y][0] = Math.abs(val[0]);
            }
            if (canvasScreen[y][1] < Math.abs(val[1])) {
                canvasScreen[y][1] = Math.abs(val[1]);
            }
            if (canvasScreen[y][2] < Math.abs(val[2])) {
                canvasScreen[y][2] = Math.abs(val[2]);
            }
        }
    }
}

function simulate(lambdaOffset) {
    // checks
    if (CANVAS_X % PIXEL_SIZE !== 0 || CANVAS_Y % PIXEL_SIZE !== 0) {
        alert("canvas size should be divisible by pixel size")
    }

    let slitWidth = slidersGetVal("b");
    let slitSpacing = slidersGetVal("d");
    let n = slidersGetVal("num_of_slits");

    for (let N = 0; N < n; N++) {
        for (let i = 0; i < slitWidth; i++) {
            simWave(xV, yV + ((n-1)*(slitSpacing/2)) + (slitWidth / 2) - (slitSpacing*N) - i, lambdaOffset);
        }
    }
}

function renderWaves() {
    fill(color(0,0,0));
    rect(0, 0, 800 + SCREEN_WIDTH, CANVAS_Y);
    for (let x = 0; x < CANVAS_X / PIXEL_SIZE; x++) {
        for (let y = 0; y < CANVAS_Y / PIXEL_SIZE; y++) {
            fill(
                color(
                    canvas[x][y][0] * BRIGHTNESS + OFFSET,
                    canvas[x][y][0] * BRIGHTNESS + OFFSET,
                    canvas[x][y][0] * BRIGHTNESS + OFFSET
                )
            );
            rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
    }
}

function renderScreen() {
    fill(color(50,50,50));
    rect(CANVAS_X, 0, SCREEN_WIDTH, CANVAS_Y);
    for (let y = 0; y < CANVAS_Y / PIXEL_SIZE; y++) {
        let x = (CANVAS_X / PIXEL_SIZE) - 1;
        var val = (canvasScreen[y][0]) * BRIGHTNESS;
        fill( color (255 * val * 0.05, 255 * val * 0.05, 255 * val * 0.05));
        rect(x * PIXEL_SIZE, y * PIXEL_SIZE, SCREEN_WIDTH / 4, PIXEL_SIZE);
        fill( color (255,255,255));
        rect(x * PIXEL_SIZE + SCREEN_WIDTH / 4, y * PIXEL_SIZE, SCREEN_WIDTH * Math.abs(val) * 0.03, PIXEL_SIZE);
    }
}

function simWave (cx, cy, offset) {
    // init canvas data
    for (let i = 0; i < CANVAS_X / PIXEL_SIZE; i++) {
        for (let j = 0; j < CANVAS_Y / PIXEL_SIZE; j++) {
            var x = i * PIXEL_SIZE;
            var y = j * PIXEL_SIZE;
            var distanceFromCenter = Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2));
            var waveSine = Math.sin((offset * 3.142*2) + (distanceFromCenter / wavelength)) * 0.1;
            var waveAmplitude = Math.pow(distanceFromCenter, -1) * 10;
            addToCanvas(i,j, waveSine * waveAmplitude,  0, 0);
        }
    }
}

function addToCanvas (x, y, r, g, b) {
    let canvasColor = canvas[x][y];
    canvas[x][y] = [canvasColor[0] + r, canvasColor[1] + g, canvasColor[2] + b];
}
