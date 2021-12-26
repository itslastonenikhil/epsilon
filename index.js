//---------------------------------
//Import Files
//---------------------------------
let filter = require("./filter")
let LR  = require("./logisticRegressionModel")

//=====================================================
// Start Epsilon: Human Activity Recognition
//=====================================================

let is_running = false;
let start_button = document.getElementById("start_epsilon");
let id;
start_button.onclick = function (e) {
  e.preventDefault();

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    stopGeolocation(id);
    document.getElementById("start_epsilon").innerHTML = "Start";
    

    is_running = false;
  } else {
    startGeolocation();
    window.addEventListener("devicemotion", handleMotion);
    document.getElementById("start_epsilon").innerHTML = "Stop";
    is_running = true;
    ;
  }
};

// Geolocation ==============================================================

let options = {
  
  // maximumAge: getValue("Max_age_gps"),
  // timeout: getValue("Timeout_gps"),
  enableHighAccuracy: Boolean(getValue("High_accuracy_gps"))
};

function stopGeolocation(id) {
  navigator.geolocation.clearWatch(id);
}

function startGeolocation() {

  let status = document.querySelector('#status');
  let mapLink = document.querySelector('#map-link');

  mapLink.href = '';
  mapLink.textContent = '';

  function success(position) {
    let latitude  = position.coords.latitude;
    let longitude = position.coords.longitude;
    let accuracy = position.coords.accuracy;
    let altitude = position.coords.altitude;
    let bearing = position.coords.bearing;
    let speed = position.coords.speed;


    status.textContent = '';
    // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.href = `https://www.google.com/maps/@${latitude},${longitude},16z`
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
    updateFieldIfNotNull("Latitude", latitude);
    updateFieldIfNotNull("Longitude", longitude);
    updateFieldIfNotNull("Altitude", altitude);
    updateFieldIfNotNull("Speed", speed);
    updateFieldIfNotNull("Bearing", bearing);
    updateFieldIfNotNull("Accuracy", accuracy);
    incrementEventCountGPS();
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }


  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    id = navigator.geolocation.watchPosition(success, error, options);
  }

}

// document.querySelector('#find-me').addEventListener('click', geoFindMe);



// Event Counter =============================================================

function incrementEventCount() {
  let counterElement = document.getElementById("num-observed-events");
  let eventCount = parseInt(counterElement.innerHTML);
  counterElement.innerHTML = eventCount + 1;
  LogisticReg();
}

function incrementEventCountGPS() {
  let counterElement = document.getElementById("num-observed-events-gps");
  let eventCount = parseInt(counterElement.innerHTML);
  counterElement.innerHTML = eventCount + 1;
}

// Update HTML values =========================================================

function updateFieldIfNotNull(fieldName, value, precision = 10) {
  if (value != null)
    document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

// Update HTML string =========================================================

function updateString(fieldName, string) {
  if (string != null)
    document.getElementById(fieldName).innerHTML = string;
}

// Convert degree to radians ===================================================
function degreesToRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Set Configuration Values =================================================

function setConfigValues(){
  let recordFreq = parseFloat(document.getElementById("Record_freq_input").value);
  let predictFreq = parseFloat(document.getElementById("Predict_freq_input").value);
  let hpfSmoothing = parseFloat(document.getElementById("HPF_smoothing_input").value);
  let lpfSmoothing = parseFloat(document.getElementById("LPF_smoothing_input").value);
  // let maxAgeGPS = parseFloat(document.getElementById("Max_age_gps_input").value);
  // let timeoutGPS = parseFloat(document.getElementById("Timeout_gps_input").value);
  let highAccGPS = parseFloat(document.getElementById("High_accuracy_gps_input").value);
  

  updateFieldIfNotNull("Record_freq", recordFreq);
  updateFieldIfNotNull("Predict_freq", predictFreq);
  updateFieldIfNotNull("HPF_smoothing", hpfSmoothing)
  updateFieldIfNotNull("LPF_smoothing", lpfSmoothing);
  // updateFieldIfNotNull("Max_age_gps", maxAgeGPS);
  // updateFieldIfNotNull("Timeout_gps", timeoutGPS);
  updateFieldIfNotNull("High_accuracy_gps", highAccGPS);

}

  let recordFreq = getValue("Record_freq");
  let predictFreq = getValue("Predict_freq");
  let hpfSmooth = getValue("HPF_smoothing");
  let lpfSmooth = getValue("LPF_smoothing");


// Record Acceleration and Gyroscope data =======================================
function handleMotion(event) {
  updateFieldIfNotNull("Accelerometer_i", event.interval, 2);

  updateFieldIfNotNull("Accelerometer_x", event.acceleration.x);
  updateFieldIfNotNull("Accelerometer_y", event.acceleration.y);
  updateFieldIfNotNull("Accelerometer_z", event.acceleration.z);

  updateFieldIfNotNull("Gyroscope_z", event.rotationRate.alpha);
  updateFieldIfNotNull("Gyroscope_x", event.rotationRate.beta);
  updateFieldIfNotNull("Gyroscope_y", event.rotationRate.gamma);

  incrementEventCount();
}

//=================================================
// Using Machine Learning Models for Prediction
//=================================================


let acc_x = [];
let acc_y = [];
let acc_z = [];

let gyr_x = [];
let gyr_y = [];
let gyr_z = [];

let lat_inc = [];
let long_inc = [];
let alt_inc = [];
let sp = [];
let bear = [];
let ac = [];

//==============================
// Logistic Regression
//==============================

function getValue(fieldName) {
    return parseFloat(document.getElementById(fieldName).innerHTML);
}

function getStatsXYZ(feature_value, x, y, z){
  feature_value.push(ss.mean(x));
  feature_value.push(ss.mean(y));
  feature_value.push(ss.mean(z));

  feature_value.push(ss.variance(x));
  feature_value.push(ss.variance(y));
  feature_value.push(ss.variance(z));

  feature_value.push(ss.medianAbsoluteDeviation(x));
  feature_value.push(ss.medianAbsoluteDeviation(y));
  feature_value.push(ss.medianAbsoluteDeviation(z));

  feature_value.push(ss.max(x));
  feature_value.push(ss.max(y));
  feature_value.push(ss.max(z));

  feature_value.push(ss.min(x));
  feature_value.push(ss.min(y));
  feature_value.push(ss.min(z));

  feature_value.push(ss.interquartileRange(x));
  feature_value.push(ss.interquartileRange(y));
  feature_value.push(ss.interquartileRange(z)); 
}


function getStatsGPS(feature_value, lat, long, alt, sp, bear, ac){
  feature_value.push(ss.mean(lat));
  feature_value.push(ss.mean(long));
  feature_value.push(ss.mean(alt));
  feature_value.push(ss.mean(sp));
  feature_value.push(ss.mean(bear));
  feature_value.push(ss.mean(ac));

  feature_value.push(ss.variance(lat));
  feature_value.push(ss.variance(long));
  feature_value.push(ss.variance(alt));
  feature_value.push(ss.variance(sp));
  feature_value.push(ss.variance(bear));
  feature_value.push(ss.variance(ac));

  feature_value.push(ss.medianAbsoluteDeviation(lat));
  feature_value.push(ss.medianAbsoluteDeviation(long));
  feature_value.push(ss.medianAbsoluteDeviation(alt));
  feature_value.push(ss.medianAbsoluteDeviation(sp));
  feature_value.push(ss.medianAbsoluteDeviation(bear));
  feature_value.push(ss.medianAbsoluteDeviation(ac));

  feature_value.push(ss.max(lat));
  feature_value.push(ss.max(long));
  feature_value.push(ss.max(alt));
  feature_value.push(ss.max(sp));
  feature_value.push(ss.max(bear));
  feature_value.push(ss.max(ac));

  feature_value.push(ss.min(lat));
  feature_value.push(ss.min(long));
  feature_value.push(ss.min(alt));
  feature_value.push(ss.min(sp));
  feature_value.push(ss.min(bear));
  feature_value.push(ss.min(ac));

  feature_value.push(ss.interquartileRange(lat));
  feature_value.push(ss.interquartileRange(long));
  feature_value.push(ss.interquartileRange(alt));
  feature_value.push(ss.interquartileRange(sp));
  feature_value.push(ss.interquartileRange(bear));
  feature_value.push(ss.interquartileRange(ac));
  
}

function overlapSlidingWindow(arr, fraction, eventCount){
    let start_index = 0; 
    let end_index = predictFreq/recordFreq; //number of elements
    let end_index_new = end_index;
    let overlap = fraction;//percentage/fraction of overlapping

    if(eventCount == predictFreq){
      end_index_new = Math.floor((1-overlap)*end_index);
    }

    arr.splice(start_index, end_index_new);
}

function LogisticReg() {


  let counterElement = document.getElementById("num-observed-events");
  let eventCount = parseInt(counterElement.innerHTML);

  // event interval = 16ms
  // 16ms * 32(eventCount) = 512ms ~ Half Seconds

  

  let prev_lat = getValue("Latitude");
  let prev_long = getValue("Longitude");
  let prev_alt = getValue("Altitude");

  let curr_lat = 0
  let curr_long = 0
  let curr_alt = 0

  if (eventCount % recordFreq == 0) {
    acc_x.push(getValue("Accelerometer_x"));
    acc_y.push(getValue("Accelerometer_y"));
    acc_z.push(getValue("Accelerometer_z"));

    gyr_x.push(degreesToRadians(getValue("Gyroscope_x")));
    gyr_y.push(degreesToRadians(getValue("Gyroscope_y")));
    gyr_z.push(degreesToRadians(getValue("Gyroscope_z")));

    curr_lat = getValue("Latitude");
    curr_long = getValue("Longitude");
    curr_alt = getValue("Altitude");

    lat_inc.push(curr_lat - prev_lat);
    long_inc.push(curr_long - prev_long);
    alt_inc.push(curr_alt - prev_alt);

    sp.push(getValue("Speed"));
    bear.push(getValue("Bearing"));
    ac.push(getValue("Accuracy"));

  }


  if (eventCount % predictFreq == 0) {
    
    //Console recorded acceleration and gyroscope values
    // console.log(acc_x);
    // console.log(acc_y);
    // console.log(acc_z);
    // console.log(gyr_x);
    // console.log(gyr_y);
    // console.log(gyr_z);

    console.log(lat_inc);
    console.log(long_inc);
    console.log(alt_inc);
    console.log(sp);
    console.log(bear);
    console.log(ac);

    acc_x = filter.lowPassFilter(acc_x, lpfSmooth);
    acc_y = filter.lowPassFilter(acc_y, lpfSmooth);
    acc_z = filter.lowPassFilter(acc_z, lpfSmooth);

    gyr_x = filter.highPassFilter(gyr_x, hpfSmooth);
    gyr_y = filter.highPassFilter(gyr_y, hpfSmooth);
    gyr_z = filter.highPassFilter(gyr_z, hpfSmooth);

    lat_inc = filter.anomalyDetector(lat_inc, 0.01);
    long_inc = filter.anomalyDetector(long_inc, 0.01);
    alt_inc = filter.anomalyDetector(alt_inc,100);

    //Get features from acceration and gyroscope values
    let feature_value = [];

    getStatsXYZ(feature_value, acc_x, acc_y, acc_z);
    getStatsXYZ(feature_value, gyr_x, gyr_y, gyr_z);
    getStatsGPS(feature_value, lat_inc, long_inc, alt_inc, sp, bear, ac)
    

    console.log(feature_value);


    //Calculate Score
    let score = [];

    for (let i = 0; i < 4; i++) {
      let sum = 0;
      for (let j = 0; j < feature_value.length; j++) {
        sum += feature_value[j] * LR.coeff[i][j];
      }
      sum += LR.intercept[i];
      score.push(sum);
    }

    //Find index with maximum score
    max_index = 0;
    max_score = score[0];
    for (let i = 0; i < 4; i++) {
      if (max_score < score[i]) {
        max_index = i;
        max_score = score[i];
      }
    }

    console.log(max_index + 1);

    //Update Activity
    
    

    switch (max_index) {
      case 0:
        updateString("LogisticRegression", "Inactive");
        break;
      case 1:
        updateString("LogisticRegression", "Active");
        break;
      case 2:
        updateString("LogisticRegression", "Walking");
        break;
      case 3:
        updateString("LogisticRegression", "Driving");
        break;
    }

    // Empty acceration and gyroscope arrays

    // acc_x = [];
    // acc_y = [];
    // acc_z = [];

    // gyr_x = [];
    // gyr_y = [];
    // gyr_z = [];

    // lat_inc = [];
    // long_inc = [];
    // alt_inc = [];
    // sp = [];
    // bear = [];
    // ac = [];(

    let overlapping_fraction = 0.5;
    overlapSlidingWindow(acc_x, overlapping_fraction,eventCount);
    overlapSlidingWindow(acc_y, overlapping_fraction,eventCount);
    overlapSlidingWindow(acc_z, overlapping_fraction,eventCount);

    overlapSlidingWindow(gyr_x, overlapping_fraction,eventCount);
    overlapSlidingWindow(gyr_y, overlapping_fraction,eventCount);
    overlapSlidingWindow(gyr_z, overlapping_fraction,eventCount);

    overlapSlidingWindow(lat_inc, overlapping_fraction,eventCount);
    overlapSlidingWindow(long_inc, overlapping_fraction,eventCount);
    overlapSlidingWindow(alt_inc, overlapping_fraction,eventCount);
    overlapSlidingWindow(sp, overlapping_fraction,eventCount);
    overlapSlidingWindow(bear, overlapping_fraction,eventCount);
    overlapSlidingWindow(ac, overlapping_fraction,eventCount);

  }
}