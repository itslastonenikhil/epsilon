//=====================================================
// Start Epsilon: Human Activity Recognition
//=====================================================

let is_running = false;
let start_button = document.getElementById("start_epsilon");
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
    document.getElementById("start_epsilon").innerHTML = "Start";
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    document.getElementById("start_epsilon").innerHTML = "Stop";
    is_running = true;
  }
};

// Geolocation ==============================================================

let options = {
  enableHighAccuracy: false
  // maximumAge: 30000,
  // timeout: 27000
};


function geoFindMe() {

  let status = document.querySelector('#status');
  let mapLink = document.querySelector('#map-link');

  mapLink.href = '';
  mapLink.textContent = '';

  function success(position) {
    let latitude  = position.coords.latitude;
    let longitude = position.coords.longitude;
    let accuracy = position.coords.accuracy;

    status.textContent = '';
    // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.href = `https://www.google.com/maps/@${latitude},${longitude},16z`
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °, Accuracy: ${accuracy}`;
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }


  if(!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.watchPosition(success, error, options);
  }

}

document.querySelector('#find-me').addEventListener('click', geoFindMe);



// Event Counter =============================================================

function incrementEventCount() {
  let counterElement = document.getElementById("num-observed-events");
  let eventCount = parseInt(counterElement.innerHTML);
  counterElement.innerHTML = eventCount + 1;
  LogisticReg();
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

// Low Pass Filter =============================================================
function lowPassFilter(real_signal, smoothing){
  let new_signal = real_signal.slice();
  let alpha = 1/smoothing;

  new_signal[0] = alpha*real_signal[0]
  for(let i = 1; i < real_signal.length; i++){
    new_signal[i] = alpha*real_signal[i] + (1-alpha)*new_signal[i-1]
  }

  new_signal[0] = new_signal[1]

  return new_signal;
}

// High Pass Filter =============================================================
function highPassFilter(real_signal, smoothing){
  let new_signal = real_signal.slice();
  let alpha = 1/smoothing;

  new_signal[0] = real_signal[0]
  for(let i = 1; i < real_signal.length; i++){
    new_signal[i] = alpha*new_signal[i-1] + alpha*(real_signal[i] - real_signal[i-1]);
  }

  new_signal[0] = new_signal[1]

  return new_signal;
}

// Set Configuration Values =================================================

function setConfigValues(){
  let recordFreq = parseFloat(document.getElementById("Record_freq_input").value);
  let predictFreq = parseFloat(document.getElementById("Predict_freq_input").value);
  let hpfSmoothing = parseFloat(document.getElementById("HPF_smoothing_input").value);
  let lpfSmoothing = parseFloat(document.getElementById("LPF_smoothing_input").value);
  

  updateFieldIfNotNull("Record_freq", recordFreq);
  updateFieldIfNotNull("Predict_freq", predictFreq);
  updateFieldIfNotNull("HPF_smoothing", hpfSmoothing)
  updateFieldIfNotNull("LPF_smoothing", lpfSmoothing);
}


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


//===============================================
// Logistic Regression Trained Coeff & Intercept
//===============================================
LG_coeff = [
  [
    6.274057, -8.6232789, 2.42906887e-1, 1.07948206, -1.76186703e-1,
    -2.69845864, -2.8437297, -1.45659258, -2.85899297e-1, -5.00915651e-1,
    -1.09268437, -2.23140584, 1.67958441, 7.11738387e-1, -1.12763499,
    -5.97530974, -2.48735751, -1.15897762, 5.3073361e-1, -3.24216282e-1,
    2.41531557e-1, -9.90446405e-1, -5.00006536e-1, -1.24522661e-1,
    -4.51266857e-1, -8.43131518e-1, -5.24673979e-1, 2.40791941, 5.25174577e-1,
    1.3384455, 1.0013845, -3.32384145e-1, -1.32635521, -9.67898702e-1,
    -1.80401592, -1.07784055,
  ],
  [
    4.47382017, 1.38941509e1, 4.74646031, -1.4827675, -8.83010903, 7.38934322,
    -6.71485834, -1.43524737e1, -1.47433109, 1.92234293, -5.32279686e-1,
    -6.42423516, -1.35537341, -1.82045094, 1.01227577, -1.87277202, -4.01414611,
    5.51271525, 1.75572761e-1, -2.01922131, 5.07134539e-1, -1.38759494e1,
    3.91759668, -3.66340583, -2.08041894, 3.30019145, -3.93079952e-1,
    -2.48656628, 2.89661181, -5.76596727e-1, -1.75288563, -3.73636333,
    6.10493185e-3, -3.25537284, 3.69775276, -3.50226986,
  ],
  [
    -6.0965812, -2.06452118, -7.29229383, 6.27012231, 1.08545947e1, 4.88124657,
    3.79227392, 4.51127069, 1.54939474, -2.74650726, 1.00754573, 4.84691359e-1,
    2.27335388, 2.83908129, 9.84613982, -2.37912907, -3.42429612, -3.8426924,
    -3.14170424e-1, 2.94177235e-1, -9.21493659e-1, 1.22963524e1, -3.37122001,
    1.72597614, 6.25512893, 1.82114461, 5.21374783, 1.84413569, -1.06916591,
    1.30252212, -4.63862253, 2.22317191, -1.88598539, 1.12373977e1, 7.15671541,
    1.10003093e1,
  ],
  [
    -3.31915577, -6.28551437, -2.07271865, -1.41657997, -4.50727286,
    -4.97316107, 1.58900473, 7.39840264, 3.64437344, 2.15392508e-1,
    8.36242284e-1, 1.34681497, 2.86434226e-1, 1.20084243, 2.55239303e-1,
    1.38251596, 6.54743703, 2.20542873, 2.32799373e-2, 1.02954678,
    -1.31583831e-1, -4.92748709e-1, -4.01676865, 1.79461438e-2, -2.22710379,
    -1.37463896, -2.15301978, 1.49055922, -1.1857021, -1.57072022,
    7.09986508e-1, 4.03729645, 2.49906487e-1, -3.63765123, -3.44691087,
    -2.33426618,
  ],
];

LG_intercept = [1.89510894, -2.01109311, -3.11238551, -3.6589588];


//=================================================
// Using Machine Learning Models for Prediction
//=================================================


let acc_x = [];
let acc_y = [];
let acc_z = [];

let gyr_x = [];
let gyr_y = [];
let gyr_z = [];

//==============================
// Logistic Regression
//==============================

function getValue(fieldName) {
    return parseFloat(document.getElementById(fieldName).innerHTML);
}

function LogisticReg() {


  let counterElement = document.getElementById("num-observed-events");
  let eventCount = parseInt(counterElement.innerHTML);

  // event interval = 16ms
  // 16ms * 32(eventCount) = 512ms ~ Half Seconds

  let recordFreq = getValue("Record_freq");
  let predictFreq = getValue("Predict_freq");
  let hpfSmooth = getValue("HPF_smoothing");
  let lpfSmooth = getValue("LPF_smoothing");

  if (eventCount % recordFreq == 0) {
    acc_x.push(getValue("Accelerometer_x"));
    acc_y.push(getValue("Accelerometer_y"));
    acc_z.push(getValue("Accelerometer_z"));

    gyr_x.push(degreesToRadians(getValue("Gyroscope_x")));
    gyr_y.push(degreesToRadians(getValue("Gyroscope_y")));
    gyr_z.push(degreesToRadians(getValue("Gyroscope_z")));
  }


  if (eventCount % predictFreq == 0) {
    
    //Console recorded acceleration and gyroscope values
    console.log(acc_x);
    console.log(acc_y);
    console.log(acc_z);
    console.log(gyr_x);
    console.log(gyr_y);
    console.log(gyr_z);

    acc_x = lowPassFilter(acc_x, lpfSmooth);
    acc_y = lowPassFilter(acc_y, lpfSmooth);
    acc_z = lowPassFilter(acc_z, lpfSmooth);

    gyr_x = highPassFilter(gyr_x, hpfSmooth);
    gyr_y = highPassFilter(gyr_y, hpfSmooth);
    gyr_z = highPassFilter(gyr_z, hpfSmooth);

    //Get features from acceration and gyroscope values
    let feature_value = [];

    feature_value.push(ss.mean(acc_x));
    feature_value.push(ss.mean(acc_y));
    feature_value.push(ss.mean(acc_z));

    feature_value.push(ss.variance(acc_x));
    feature_value.push(ss.variance(acc_y));
    feature_value.push(ss.variance(acc_z));

    feature_value.push(ss.medianAbsoluteDeviation(acc_x));
    feature_value.push(ss.medianAbsoluteDeviation(acc_y));
    feature_value.push(ss.medianAbsoluteDeviation(acc_z));

    feature_value.push(ss.max(acc_x));
    feature_value.push(ss.max(acc_y));
    feature_value.push(ss.max(acc_z));

    feature_value.push(ss.min(acc_x));
    feature_value.push(ss.min(acc_y));
    feature_value.push(ss.min(acc_z));

    feature_value.push(ss.interquartileRange(acc_x));
    feature_value.push(ss.interquartileRange(acc_y));
    feature_value.push(ss.interquartileRange(acc_z));

    feature_value.push(ss.mean(gyr_x));
    feature_value.push(ss.mean(gyr_y));
    feature_value.push(ss.mean(gyr_z));

    feature_value.push(ss.variance(gyr_x));
    feature_value.push(ss.variance(gyr_y));
    feature_value.push(ss.variance(gyr_z));

    feature_value.push(ss.medianAbsoluteDeviation(gyr_x));
    feature_value.push(ss.medianAbsoluteDeviation(gyr_y));
    feature_value.push(ss.medianAbsoluteDeviation(gyr_z));

    feature_value.push(ss.max(gyr_x));
    feature_value.push(ss.max(gyr_y));
    feature_value.push(ss.max(gyr_z));

    feature_value.push(ss.min(gyr_x));
    feature_value.push(ss.min(gyr_y));
    feature_value.push(ss.min(gyr_z));

    feature_value.push(ss.interquartileRange(gyr_x));
    feature_value.push(ss.interquartileRange(gyr_y));
    feature_value.push(ss.interquartileRange(gyr_z));

    console.log(feature_value);

    //Calculate Score
    let score = [];

    for (let i = 0; i < 4; i++) {
      let sum = 0;
      for (let j = 0; j < feature_value.length; j++) {
        sum += feature_value[j] * LG_coeff[i][j];
      }
      sum += LG_intercept[i];
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

    acc_x = [];
    acc_y = [];
    acc_z = [];

    gyr_x = [];
    gyr_y = [];
    gyr_z = [];


    // Overlapping
    
    //Remove first 32 elements of 64

    // let start_index = 0;
    // let delete_elements = 32;

    // if(eventCount == 128){
      
    //   acc_x.splice(start_index, delete_elements);
    //   acc_y.splice(start_index, delete_elements);
    //   acc_z.splice(start_index, delete_elements);

    //   gyr_x.splice(start_index, delete_elements);
    //   gyr_y.splice(start_index, delete_elements);
    //   gyr_z.splice(start_index, delete_elements);

    // }
    // else{
    //   start_index = 0;
    //   delete_elements = 64;

    //   acc_x.splice(start_index, delete_elements);
    //   acc_y.splice(start_index, delete_elements);
    //   acc_z.splice(start_index, delete_elements);

    //   gyr_x.splice(start_index, delete_elements);
    //   gyr_y.splice(start_index, delete_elements);
    //   gyr_z.splice(start_index, delete_elements);

    // }
    
  }
}