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

  // let status = document.querySelector('#status');
  // let mapLink = document.querySelector('#map-link');

  // mapLink.href = '';
  // mapLink.textContent = '';

  function success(position) {
    let latitude  = position.coords.latitude;
    let longitude = position.coords.longitude;
    let accuracy = position.coords.accuracy;
    let altitude = position.coords.altitude;
    let bearing = position.coords.bearing;
    let speed = position.coords.speed;


    // status.textContent = '';
    // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    // mapLink.href = `https://www.google.com/maps/@${latitude},${longitude},16z`
    // mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
    updateFieldIfNotNull("Latitude", latitude);
    updateFieldIfNotNull("Longitude", longitude);
    updateFieldIfNotNull("Altitude", altitude);
    updateFieldIfNotNull("Speed", speed);
    updateFieldIfNotNull("Bearing", bearing);
    updateFieldIfNotNull("Accuracy", accuracy);
    incrementEventCountGPS();
  }

  function error() {
    // status.textContent = 'Unable to retrieve your location';
  }


  if(!navigator.geolocation) {
    // status.textContent = 'Geolocation is not supported by your browser';
  } else {
    // status.textContent = 'Locating…';
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

function updateFieldIfNotNull(fieldName, value, precision = 5) {
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
  

  updateFieldIfNotNull("Record_freq", recordFreq, 1);
  updateFieldIfNotNull("Predict_freq", predictFreq, 1);
  updateFieldIfNotNull("HPF_smoothing", hpfSmoothing, 1)
  updateFieldIfNotNull("LPF_smoothing", lpfSmoothing, 1);
  // updateFieldIfNotNull("Max_age_gps", maxAgeGPS);
  // updateFieldIfNotNull("Timeout_gps", timeoutGPS);
  updateFieldIfNotNull("High_accuracy_gps", highAccGPS, 1);

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
LG_coeff = [[ 1.84728791e-01, -7.21728064e-01, -4.05970724e-01,
  -2.69111601e+00, -4.28016627e+00, -4.52340724e+00,
  -8.08529228e-01, -8.96336353e-01, -9.12298147e-01,
  -4.64439123e+00, -5.28522647e+00, -6.17590599e+00,
   5.26125202e+00,  4.52833421e+00,  6.12844237e+00,
  -1.64333318e+00, -1.80894509e+00, -1.87965471e+00,
   8.42031220e-03, -2.27377420e-04,  5.68395937e-03,
  -7.40018978e-01, -3.45144720e-01, -1.15014645e-01,
  -3.90599303e-01, -2.77612863e-01, -1.52643485e-01,
  -1.07717964e+00, -1.15180056e+00, -5.85381446e-01,
   1.55182458e+00,  1.15669763e+00,  5.73550506e-01,
  -8.11991681e-01, -5.80119601e-01, -3.13082905e-01,
  -9.91305404e-03, -6.79454923e-03,  3.41761723e-01,
  -2.67458605e+00, -2.30244724e+00,  1.13887833e+01,
  -1.16798065e-06, -5.49445282e-06, -9.91023085e-01,
  -5.44123576e+00, -3.10835789e-01, -6.55637039e+00,
  -5.94407729e-05, -8.17725485e-05, -1.40197396e+00,
  -2.60303139e-01, -4.54743561e+00, -3.25041780e+00,
  -1.02369548e-02, -7.58323765e-03,  1.41150373e+00,
  -3.90025355e+00,  1.37347170e-01,  1.18770821e+01,
  -9.64679267e-03, -6.08898175e-03, -1.74721507e+00,
  -1.11983019e+00,  2.30958811e+00, -2.32708443e+01,
  -3.71742380e-04, -9.50753700e-04, -9.81203067e-01,
  -1.55194533e+00, -4.78412906e-01,  3.58223421e+01],
 [ 3.36691294e-01,  4.57626792e+00,  2.59563704e-01,
  -4.19923694e+00, -1.68924146e+01, -9.29265834e+00,
  -3.67062567e-01, -2.27168326e+00,  2.42285673e-01,
   1.53543441e+00,  3.43837890e-01, -4.98886630e-01,
  -4.94333017e+00, -5.20337336e+00, -6.96920662e+00,
  -4.52420434e-01, -3.98736697e+00,  9.33788576e-01,
  -4.17204763e-02,  9.10897937e-03, -5.55867137e-02,
  -2.46171640e+00,  3.98295809e-01, -3.44251032e-01,
  -1.10782660e+00,  4.15665862e-02, -4.06498656e-01,
  -4.52414035e-01,  2.61661673e+00,  3.68313378e-01,
  -5.57171939e-01, -2.75965557e+00, -7.09677685e-01,
  -2.34151496e+00, -4.32326242e-02, -7.90487739e-01,
   3.39503001e-02,  2.07839750e-02,  7.02802498e-01,
  -1.30660364e+01, -1.67920491e+01,  2.39028610e+02,
  -6.82961385e-06, -1.78319588e-05, -8.79135514e+00,
  -4.60020701e+01, -1.52553498e+02, -1.57957011e+01,
  -4.57225787e-04, -5.76701279e-04, -1.02312888e+00,
  -1.35081594e+00, -1.31156509e+01,  2.84874669e+01,
   3.27777838e-02,  1.93035815e-02,  1.72144924e+01,
  -1.92590700e+01, -1.81363036e+01,  2.09512980e+01,
   3.47122335e-02,  2.17368370e-02, -1.78887327e+01,
  -2.58660253e+00,  3.39574878e+01, -2.59938216e+02,
  -1.56406561e-03, -2.20095244e-03, -8.57623910e+00,
  -8.78823805e+00, -2.57933586e+01,  2.39917713e+02],
 [ 6.59418775e-01, -4.21520742e+00, -4.36573109e-01,
   3.65082016e+01,  1.03023141e+02,  7.60654513e+01,
   5.16342864e+00,  1.43061598e+01,  4.65780604e+00,
  -1.65337066e+01,  4.69476851e+00, -1.81414768e+01,
   2.76264354e+01,  1.93316321e+01,  2.43754822e+01,
   9.49682194e+00,  2.72571914e+01,  9.29692239e+00,
   1.01404555e-02, -3.49756156e-02, -1.59138025e-01,
   2.31708926e+01,  3.27086418e+00,  1.68200912e+00,
   1.06321708e+01,  3.15688919e+00,  2.45347413e+00,
   8.55719957e+00, -4.45617872e+00, -2.72939251e+00,
  -1.04966365e+01,  3.52106009e+00,  2.19081879e+00,
   2.22557172e+01,  7.17272379e+00,  4.85205490e+00,
  -1.26615623e-02, -7.89429769e-03,  3.35225250e+00,
  -5.17915571e+01,  8.93381497e+00,  4.25511718e+01,
   4.61364927e-05,  6.48745809e-05, -2.36496946e+00,
  -1.51268607e+02,  2.04524943e-02, -2.55286918e+00,
  -7.14613419e-04, -1.02268005e-03,  1.28261831e+01,
  -6.92468554e+00,  9.49930146e+00,  3.05231963e+01,
  -1.19817101e-02, -1.18094879e-02,  2.58418184e+00,
  -8.19510346e+01, -3.11203443e+00,  6.67448514e+01,
  -1.34850795e-02, -4.74461405e-03, -8.11031727e+00,
  -1.13327665e+01, -5.64185025e+00, -1.09462985e+02,
   1.37436539e-03, -4.15301227e-03,  1.17070461e+01,
  -3.55894383e+01,  2.29327422e+00,  3.46066255e+01],
 [-5.17543590e-01,  7.08188474e-01,  2.55472958e-01,
  -2.51362323e+01, -4.78152899e+01, -4.48890037e+01,
  -3.63240305e+00, -6.08161255e+00, -4.10820670e+00,
  -1.66767073e+01, -2.46028328e+01, -1.96092937e+01,
   2.07724643e+01,  2.71538128e+01,  3.18388517e+01,
  -7.30437192e+00, -1.22536150e+01, -8.65702101e+00,
  -2.40144011e-03,  3.24278369e-02,  8.13277744e-02,
  -9.11306136e+00, -3.26493722e+00, -1.08531206e+00,
  -4.07728543e+00, -2.00057442e+00, -1.02956296e+00,
  -8.73862774e+00, -6.39082967e+00, -3.44855384e+00,
   1.07348969e+01,  6.65139683e+00,  3.63848723e+00,
  -8.47859926e+00, -4.22121489e+00, -2.05014044e+00,
   1.04973923e-03,  1.68638185e-03,  4.15364858e+00,
   3.12462774e+01, -6.00066606e+00, -2.32970840e+02,
  -8.96903421e-06, -1.44214900e-05,  3.13484252e+00,
   7.65822621e+01,  7.32395886e-01,  2.55678215e+01,
   4.60901071e-04,  6.02124989e-04, -9.23320141e+00,
   3.05682276e+00, -1.24902475e-01, -1.62643448e+01,
   1.57742002e-03,  3.04257629e-03, -6.44882194e+00,
   4.56950120e+01,  2.18083476e+01, -6.28268689e+01,
   6.89189240e-04,  7.84095799e-04,  1.66860927e+01,
   1.20410271e+01, -5.23305427e+00,  7.05348513e+01,
   4.78143221e-04,  1.57381075e-03, -1.36048702e+01,
   1.75771865e+01,  1.18257212e+01, -1.49259015e+02]];

LG_intercept = [3.0843881 ,  -6.40381069, -10.7418344 ,   1.09786996];


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