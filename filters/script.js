// =====================
// ELEMENTS
// =====================
const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

// =====================
// FILTER STATE
// =====================
let currentFilter = "glasses";
function setFilter(filter) {
    currentFilter = filter;
}

// =====================
// LOAD FILTER IMAGES
// =====================
const filters = {
    glasses: new Image(),
    mustache: new Image(),
    dog: new Image(),
    crown: new Image(),
    hat: new Image()
};

filters.glasses.src = "filters/glasses.png";
filters.mustache.src = "filters/mustache.png";
filters.dog.src = "filters/dog_nose.png";
filters.crown.src = "filters/crown.png";
filters.hat.src = "filters/hat.png";

// =====================
// START CAMERA
// =====================
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
        initApp();
    })
    .catch(err => console.error("Camera error:", err));

// =====================
// INIT FACE API
// =====================
async function initApp() {

    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    console.log("Models loaded");

    await new Promise(resolve => {
        if (video.videoWidth) resolve();
        else video.onloadedmetadata = resolve;
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(detectFace, 120);
}

// =====================
// FACE DETECTION LOOP
// =====================
async function detectFace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

    if (!detection) return;

    drawFilter(detection.landmarks);
}

// =====================
// DRAW FILTERS (BIGGER SIZES)
// =====================
function drawFilter(landmarks) {

    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();

    // Base scale
    const eyeDistance = rightEye[3].x - leftEye[0].x;
    const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
    const eyeCenterY = (leftEye[0].y + rightEye[0].y) / 2;

    // 😎 GLASSES (BIGGER)
    if (currentFilter === "glasses") {
        ctx.drawImage(
            filters.glasses,
            eyeCenterX - eyeDistance * 1.2,
            eyeCenterY - eyeDistance * 0.7,
            eyeDistance * 2.4,
            eyeDistance * 1.3
        );
    }

    // 👨‍🦱 MUSTACHE (BIGGER)
    if (currentFilter === "mustache") {
        ctx.drawImage(
            filters.mustache,
            nose[0].x - eyeDistance * 0.5,
            nose[0].y + eyeDistance * 0.25,
            eyeDistance * 1.0,
            eyeDistance * 0.7
        );
    }

    // 🐶 DOG NOSE (BIGGER)
    if (currentFilter === "dog") {
        ctx.drawImage(
            filters.dog,
            nose[0].x - eyeDistance * 0.35,
            nose[0].y - eyeDistance * 0.15,
            eyeDistance * 1,
            eyeDistance * 1
        );
    }

    // 👑 CROWN (BIGGER & ABOVE HEAD)
    if (currentFilter === "crown") {
        ctx.drawImage(
            filters.crown,
            eyeCenterX - eyeDistance * 1.5,
            eyeCenterY - eyeDistance * 2.4,
            eyeDistance * 3.0,
            eyeDistance * 2.2
        );
    }

    // 🎩 HAT (BIGGER)
    if (currentFilter === "hat") {
        ctx.drawImage(
            filters.hat,
            eyeCenterX - eyeDistance * 1.6,
            eyeCenterY - eyeDistance * 2.7,
            eyeDistance * 3.2,
            eyeDistance * 2.2
        );
    }
}
