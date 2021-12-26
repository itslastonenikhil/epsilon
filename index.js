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

// Anomaly Detector =============================================================

function anomalyDetector(real_signal, threshold){
 
  let new_signal= real_signal.filter(function(value){return value < threshold;});

  if(new_signal.length == 0) new_signal = [0, 0];

  return new_signal;
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


//===============================================
// Logistic Regression Trained Coeff & Intercept
//===============================================
LG_coeff = [
  [ 2.03580377e+01, -4.72994122e+01, -3.38179562e+01,-1.31135003e+02, -1.93188214e+02, -2.13263293e+02,-4.61321492e+01, -4.78324538e+01, -5.06371922e+01,-2.31418679e+02, -2.89909255e+02, -3.22196256e+02, 2.87105515e+02,  2.21891286e+02,  2.85679819e+02,-9.33933838e+01, -9.58691471e+01, -1.03849185e+02, 7.45017764e-01, -1.33695264e-01,  6.11735343e-01,-3.60146139e+01, -1.68419859e+01, -5.22725202e+00,-1.97715180e+01, -1.52479339e+01, -8.25402699e+00,-4.50530331e+01, -5.34517595e+01, -2.31658004e+01, 7.53012294e+01,  5.38573920e+01,  2.28713033e+01,-4.12123188e+01, -3.15241134e+01, -1.69517520e+01,-9.38395624e-01, -7.72416660e-01,  1.33351224e+01,-1.17561211e+02,  3.16741355e+00,  5.75690506e+02,-8.90064536e-05, -4.37948061e-04, -8.46889904e+00,-4.05101940e+02, -7.51625968e+00, -1.35869439e+02,-4.36306207e-03, -5.67865693e-03, -7.88758286e+01,-1.69809485e+01, -2.51974834e+02, -2.77749730e+02,-9.69265676e-01, -8.34123562e-01, -9.27773794e+00,-2.13742045e+02, -2.33916037e+01, -3.48813203e+01,-9.13878359e-01, -7.17945880e-01, -6.40041529e+00,-1.14517215e+01,  2.68191207e+01, -5.39899913e+02,-3.53397208e-02, -7.65950901e-02, -1.26533068e+02,-1.16668055e+02, -5.83990259e+01,  6.80108504e+02],
  [ 5.73611142e+00,  1.54750354e+02,  1.65168958e+01,-1.33273140e+02, -5.57921576e+02, -2.81592421e+02,-3.96675593e+00, -6.93712578e+01,  2.25870243e+01, 4.18423673e+01,  2.48881434e+01, -1.31195599e+01,-1.76723688e+02, -1.63394297e+02, -1.85620415e+02, 3.51971109e+00, -1.15912037e+02,  6.26177038e+01,-1.80269344e+00,  8.09505591e-01, -1.56924206e+00,-8.69251366e+01,  1.34283611e+01, -1.29702353e+01,-3.71150627e+01,  3.39941775e+00, -1.28347311e+01,-1.31884714e+01,  8.88638662e+01,  2.13276971e+01,-1.52021418e+01, -9.77090600e+01, -2.67581795e+01,-7.87118558e+01,  1.55389827e+00, -2.52050183e+01, 1.47852886e+00,  9.23677697e-01, -3.19325946e+01,-4.32586162e+02, -4.21931920e+02,  3.88433093e+03,-2.52657140e-04, -6.77860131e-04, -6.22733022e+01,-1.63506001e+03, -3.77507947e+02, -1.78871167e+01,-1.60083003e-02, -2.03059612e-02, -3.70793358e+01,-4.78499503e+01, -4.89126570e+02,  7.75933211e+02, 1.42524362e+00,  8.55962546e-01,  2.26299214e+02,-6.74863873e+02, -7.52443630e+02, -1.90160452e+02, 1.51987403e+00,  9.76523387e-01, -1.89631905e+02,-7.59648747e+01,  1.16756154e+03, -3.69426623e+03,-6.40958568e-02, -8.57870431e-02, -4.73403327e+02,-3.37324406e+02, -1.09810315e+03,  1.96187317e+03],
  [-9.51133936e-01, -4.90499946e+01, -4.63526585e+00, 3.60118166e+02,  1.12540822e+03,  8.01608646e+02, 7.94273393e+01,  1.89914705e+02,  7.83939857e+01,-1.36089863e+02,  1.22427774e+02, -1.61125358e+02, 3.54506599e+02,  2.51482144e+02,  3.67328971e+02, 1.43668390e+02,  3.52548147e+02,  1.53817073e+02,-2.59719771e-01, -8.97478283e-01, -6.63521771e-01, 3.39765147e+02,  4.44639979e+01,  2.97050242e+01, 1.62932680e+02,  5.15701270e+01,  4.43455411e+01, 1.99195346e+02,  4.95304276e+00,  2.27281040e+01,-2.35431910e+02, -1.37219873e+01, -2.51886725e+01, 3.42006152e+02,  1.18965109e+02,  8.81662846e+01,-1.23371014e-01, -3.95006796e-02,  9.47462119e+00,-7.04382961e+02,  3.59155953e+01,  2.56687888e+02, 1.15919583e-03,  1.56005360e-03, -1.66642598e+01,-2.46758991e+03, -5.36119271e-01, -2.53920907e+01,-1.36768037e-02, -1.94480239e-02,  1.67972600e+02,-9.62713528e+01,  3.41857036e+01,  4.46541805e+02,-8.18241856e-02, -8.76156088e-02,  9.40139480e+01,-1.13215205e+03,  1.30352938e+00,  2.53853289e+02,-1.73123965e-01, -2.39201195e-02, -1.02386088e+02,-9.59253961e+01, -2.58098101e+01, -5.09631386e+02, 6.37261241e-02, -4.70492834e-02,  1.39064554e+02,-5.13589172e+02,  1.27229378e+01,  9.66366764e+01],
  [-2.36961423e+01,  1.41479638e+01, -8.67656092e+00,-8.05324952e+02, -1.62940812e+03, -1.63052901e+03,-1.33665732e+02, -2.20007408e+02, -1.67479201e+02,-5.42478275e+02, -8.81640142e+02, -5.51120339e+02, 6.13056955e+02,  8.59542910e+02,  1.06847051e+03,-2.67032612e+02, -4.40693968e+02, -3.54924832e+02, 4.56381202e-01,  1.59064734e+00,  2.35080563e+00,-4.12287830e+02, -1.40907528e+02, -4.66596878e+01,-1.87435249e+02, -9.29895350e+01, -4.91094512e+01,-4.00015586e+02, -3.04788142e+02, -1.58021275e+02, 5.16386380e+02,  3.20040125e+02,  1.62795497e+02,-3.95029882e+02, -1.96641973e+02, -9.62851866e+01,-2.21093137e-02,  7.25033174e-02,  6.83841217e+01, 1.25906878e+03, -1.35113061e+02, -4.32692091e+03,-7.24746480e-04, -8.43486905e-04,  5.52752819e+01, 4.64090963e+03,  8.75050264e-01, -5.17714501e+00, 3.29887850e-02,  4.58913302e-02, -2.12367427e+02, 1.70476411e+02,  7.13514488e+01, -5.02735745e+02,-8.48063735e-03,  1.69643407e-01, -5.05369753e+02, 2.10920588e+03,  3.04101551e+02, -1.48664278e+02,-1.39771013e-02,  1.97027420e-02,  4.39278972e+02, 1.96054358e+02, -1.80625002e+02,  4.46967119e+03,-4.82659718e-03,  1.06074951e-01, -3.07512319e+02, 1.03786379e+03,  1.23679425e+02, -8.22606220e+02]
];

LG_intercept = [252.38648935,  -537.02880701, -3724.36648016,  -178.28922407];


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

    acc_x = lowPassFilter(acc_x, lpfSmooth);
    acc_y = lowPassFilter(acc_y, lpfSmooth);
    acc_z = lowPassFilter(acc_z, lpfSmooth);

    gyr_x = highPassFilter(gyr_x, hpfSmooth);
    gyr_y = highPassFilter(gyr_y, hpfSmooth);
    gyr_z = highPassFilter(gyr_z, hpfSmooth);

    lat_inc = anomalyDetector(lat_inc, 0.01);
    long_inc = anomalyDetector(long_inc, 0.01);
    alt_inc = anomalyDetector(alt_inc,100);

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