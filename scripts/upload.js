function request(blob, callback) {
  var timeout = false, success = false;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/pictures', true);
  xhr.setRequestHeader('Response-Type', 'application/form-data');
  xhr.onload = function(e) {
    if(!timeout) {
      success = true;
      callback(false);
    }
  };
  var fd = new FormData();
  fd.append('pictureData', blob, 'image.jpg');
  fd.append('id', 1)
  xhr.send(fd);
  setTimeout(function() {
    if(!success) {
      timeout = true;
      callback(true);
    }
  }, 40000);
}

function getBlob(callback) {
  var text = '';

  for(var i = 0; i<150000; i++) {
    text += 'f';
  }

  var blob = new Blob([text], { type: 'text/plain' });
  callback(blob);
}

function avg(arr) {
  var sum = 0, n = 0;
  for(var i = 0; i < arr.length; i++) {
    sum += arr[i];
    n++;
  }

  return sum/n;
}

getBlob(function(blob) {
  var maxRequests = 6;
  var samples = 1;
  var results = [];
  var sampleSize = 10;

  var requests = 1;
  var min = 100000000000000, max = 0;
  var slicedRequests = 0;
  var duration = 0;
  var timeouts = 0;


  function test() {
    var size = blob.size;
    var bytesPerChunk = size / requests;
    var start = 0;
    var end = bytesPerChunk;
    var timeStart = Date.now();
    var slicedRequests = 0;
    var slicedMax = 0;

    for(var i = 0; i < requests; i++) {
      request(blob.slice(start, end), function(timeout) {
        slicedRequests++;
        if(timeout) {
          timeouts++;
        }

        duration = Date.now() - timeStart;
        if(duration > slicedMax) {
          slicedMax = duration;
        }
        if(slicedRequests !== requests) {
          return;
        }
        results.push(duration);
        if(slicedMax < min) {
          min = slicedMax;
        }
        if(slicedMax > max) {
          max = slicedMax;
        }

        if(samples < sampleSize) {
          slicedMax = 0;
          slicedRequests = 0;
          duration = 0;
          samples++;
          return test();
        }

        // Increase and report concurrency and metrics
        if(requests <= maxRequests) {
          var tr = document.createElement('tr');
          var td = document.createElement('td');
          td.innerHTML = requests;
          tr.appendChild(td);
          var td = document.createElement('td');
          td.innerHTML = avg(results);
          tr.appendChild(td);
          var td = document.createElement('td');
          td.innerHTML = min;
          tr.appendChild(td);
          var td = document.createElement('td');
          td.innerHTML = max;
          tr.appendChild(td);
          var td = document.createElement('td');
          td.innerHTML = samples;
          tr.appendChild(td);
          var td = document.createElement('td');
          td.innerHTML = timeouts;
          tr.appendChild(td);
          document.querySelector('.table-body').appendChild(tr);
          results = [];
          samples = 1;
          timeouts = 0;
          slicedMax = 0;
          slicedRequests = 0;
          min = 100000000000000;
          max = 0;
          requests++;
          test();
        }
      });
    }
  }
  test();

});


