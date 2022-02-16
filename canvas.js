function getRandomInt(min, max) { //Random int function from MDN web docs
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

window.onload = function () {

    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let score = 0;

    let keysDown = {};

    // let frameCount = 0; //for testing
    let fps = 0;
    let framesThisSecond = 0;

    setInterval(function () { fps = framesThisSecond; framesThisSecond = 0; }, 1000);

    let lastFrameTimeMs = 0;
    let timestep = 1000 / 60;

    let house = { //Initialize house, positions of house and person were previously random but are now specified to track nondeterminism/determinism
        x: getRandomInt(0, 481),
        y: getRandomInt(0, 331),
        velocity_x: (Math.floor(Math.random() * 2) == 0) ? .3 : -.3,
        velocity_y: (Math.floor(Math.random() * 2) == 0) ? .2 : -.2
        // x: 20, //for testing determinism
        // y: 100,
        // velocity_x: .3,
        // velocity_y: -.2
    }

    let person = { //Initialize person
        x: getRandomInt(0, 581),
        y: getRandomInt(0, 351),
        velocity_x: (Math.floor(Math.random() * 2) == 0) ? .4 : -.4,
        velocity_y: (Math.floor(Math.random() * 2) == 0) ? .3 : -.3,
        // x: 75, // for testing determinism
        // y: 285,
        // velocity_x: -.4,
        // velocity_y: -.3,
        rotate: true
    }

    let armAngle = 0; //Initialize arm angle/velocity
    let armAngleVelocity = Math.PI / 1000;

    let legAngle = 0; //Initialize leg angle

    window.addEventListener("keydown", function (event) { //Checking for spacebar or arrow keys

        if (event.key == " ") { //Using the keysDown array here was randomizing position several times before the keyup event was triggered, so it is separate from the arrow keys
            house = {
                x: getRandomInt(0, 481),
                y: getRandomInt(0, 331),
                velocity_x: (Math.floor(Math.random() * 2) == 0) ? .3 : -.3,
                velocity_y: (Math.floor(Math.random() * 2) == 0) ? .2 : -.2
                // x: 20, // for testing determinism
                // y: 100,
                // velocity_x: .3,
                // velocity_y: -.2

            }
            person = {
                x: getRandomInt(0, 581),
                y: getRandomInt(0, 351),
                velocity_x: (Math.floor(Math.random() * 2) == 0) ? .4 : -.4,
                velocity_y: (Math.floor(Math.random() * 2) == 0) ? .3 : -.3,
                // x: 75, // for testing determinism
                // y: 285,
                // velocity_x: -.4,
                // velocity_y: -.3,
                rotate: true
            }
        }
        else {
            if (event.defaultPrevented) {
                return;
            }

            keysDown[event.key] = true;

            event.preventDefault();
        }
    }, true);

    window.addEventListener("keyup", function (event) {
        if (event.defaultPrevented) {
            return;
        }

        keysDown[event.key] = false;

        event.preventDefault();
    }, true);

    requestAnimationFrame(mainLoop); //begin animation

    let delta = 0;

    function mainLoop(timestamp) {

        processInput();

        if (timestamp < lastFrameTimeMs + timestep) { //throttle fps
            requestAnimationFrame(mainLoop);
            return;
        }
        delta += timestamp - lastFrameTimeMs; //accumulated non-simulated time
        lastFrameTimeMs = timestamp;

        let numUpdateSteps = 0;
        while (delta >= timestep) {  //fixed time step simulation
            update(timestep);
            delta -= timestep;
            if (++numUpdateSteps >= 240) {
                delta = 0;
                break;
            }
        }

        draw();
        requestAnimationFrame(mainLoop);
    }

    function processInput() {
        if (keysDown.ArrowLeft && house.velocity_x != 0) { //change velocity based on arrow keys
            person.velocity_x -= .05;
        }
        if (keysDown.ArrowRight && house.velocity_x != 0) {
            person.velocity_x += .05;
        }
        if (keysDown.ArrowDown && house.velocity_x != 0) {
            person.velocity_y += .05;
        }
        if (keysDown.ArrowUp && house.velocity_x != 0) {
            person.velocity_y -= .05;
        }
    }

    function update(delta) {
        updatePos(house, 480, 330, delta); //update positions of house and person, using maximum boundaries for them to not fall off canvas
        updatePos(person, 580, 350, delta);

        legAngle += Math.PI / 200 * delta; //update leg angle

        armAngle += armAngleVelocity * delta; //update arm angle
        if (armAngle > Math.PI / 4 || armAngle < -Math.PI / 4) {
            armAngleVelocity = -armAngleVelocity;
            if (armAngle > Math.PI / 4) {
                armAngle = Math.PI / 4;
            }
            else {
                armAngle = -Math.PI / 4
            }
        }

        //check if person's chest touches the door, if so stop the animation
        if (person.x + 30 >= house.x + 60 && person.x + 30 <= house.x + 100 && person.y + 60 >= house.y + 90 && person.y + 60 <= house.y + 150) {
            if (person.rotate) score++; //only increase score once per play
            person.velocity_x = 0;
            person.velocity_y = 0;
            person.rotate = false;
            house.velocity_x = 0;
            house.velocity_y = 0;
        }
    }

    function updatePos(obj, right, bottom, delta) { //update position and flip direction if at boundary
        obj.x = obj.x + obj.velocity_x * delta;
        obj.y = obj.y + obj.velocity_y * delta;

        if (obj.x > right) {
            obj.velocity_x = -obj.velocity_x;
            obj.x = right;
        }

        if (obj.x < 0) {
            obj.velocity_x = -obj.velocity_x;
            obj.x = 0;
        }

        if (obj.y > bottom) {
            obj.velocity_y = -obj.velocity_y;
            obj.y = bottom;
        }

        if (obj.y < 0) {
            obj.velocity_y = -obj.velocity_y;
            obj.y = 0;
        }

    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "lightgreen";
        context.fillRect(0, 0, 640, 480); //background
        drawHouse();
        drawPerson();

        //draw the fps counter and score
        context.fillStyle = "black";
        context.font = '20px serif';
        context.fillText("FPS: " + fps, 10, 30);
        context.fillText("Score: " + score, 550, 30);

        ++framesThisSecond;
        // ++frameCount; //for testing
        // if (frameCount < 50) {
        //     console.log("house.x: " + house.x);
        //     console.log("frame: " + frameCount);
        // }
    }

    function drawHouse() { //inspired by MDN web docs example
        context.save();
        context.translate(house.x, house.y);

        context.lineWidth = 8;

        //Wall
        context.fillStyle = "red";
        context.fillRect(20, 60, 120, 90);
        context.strokeRect(20, 60, 120, 90);

        // Door
        context.fillStyle = "black";
        context.fillRect(60, 90, 40, 60);

        // Roof
        context.beginPath();
        context.moveTo(0, 60);
        context.lineTo(80, 0);
        context.lineTo(160, 60);
        context.closePath();
        context.fillStyle = "yellow";
        context.fill();
        context.stroke();

        context.restore();
    }

    function drawPerson() {
        context.save();
        context.translate(person.x, person.y);

        context.lineWidth = 3;

        //Head
        context.beginPath();
        context.arc(30, 20, 20, 0, 2 * Math.PI, false);
        context.fillStyle = "white";
        context.fill();

        //Spine
        context.moveTo(30, 40);
        context.lineTo(30, 90);
        context.closePath();
        context.stroke();

        //Eyes
        context.beginPath();
        context.moveTo(25, 10);
        context.lineTo(25, 18);
        context.closePath();
        context.stroke();
        context.beginPath();
        context.moveTo(35, 10);
        context.lineTo(35, 18);
        context.closePath();
        context.stroke();

        //Mouth
        context.beginPath();
        context.arc(30, 25, 10, 0, Math.PI, false);
        context.closePath();
        context.stroke();

        //Arms
        context.save();
        context.translate(30, 60);
        if (person.rotate) {
            context.rotate(armAngle);
        }
        drawArm(30);
        drawArm(-30);
        context.restore();

        //Legs
        context.save();
        context.translate(30, 90);
        if (person.rotate) {
            context.rotate(legAngle);
        }
        drawLeg(30);
        drawLeg(-30);
        context.restore();

        context.restore();
    }

    function drawArm(end) {
        context.beginPath();

        context.moveTo(0, 0);
        context.lineTo(end, 0);

        context.closePath();
        context.stroke();
    }

    function drawLeg(end) {
        context.beginPath();

        context.moveTo(0, 0);
        context.lineTo(end, 30);

        context.closePath();
        context.stroke();
    }
}