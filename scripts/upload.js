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
  }, 3000);
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
  var maxRequests = 10;
  var samples = 0;
  var results = [];
  var sampleSize = 10;

  var requests = 1;
  var min = 100000000000000, max = 0;


  function test() {
    var size = blob.size;
    var bytesPerChunk = size / requests;
    var start = 0;
    var end = bytesPerChunk;
    var timeStart = Date.now();
    var n = 0, timeouts = 0;
    while(start < size) {
      request(blob.slice(start, end), function(timeout) {
        if(timeout) {
          timeouts++;
        }
        n++;
        if(n === requests) {
          samples++;
          if(samples <= sampleSize) {
            var duration = Date.now() - timeStart;
            results.push(duration);
            if(duration < min) {
              min = duration;
            }
            if(duration > max) {
              max = duration;
            }
            return test();
          }
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
            td.innerHTML = sampleSize;
            tr.appendChild(td);
            var td = document.createElement('td');
            td.innerHTML = timeouts;
            tr.appendChild(td);
            document.querySelector('.table-body').appendChild(tr);
            results = [];
            samples = 0;
            timeouts = 0;
            requests++;
            min = 100000000000000;
            max = 0;
            test();
          }
        }
      });
      start = end;
      end = start + bytesPerChunk;
    }
  }
  test();

});


