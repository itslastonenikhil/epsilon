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

module.exports = {lowPassFilter, highPassFilter, anomalyDetector};
  