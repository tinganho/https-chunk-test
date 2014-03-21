function request(blob, callback) {
  var timeout = false, success = false;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/pictures', true);
  xhr.setRequestHeader('Response-Type', 'application/form-data');
  xhr.onload = function(e) {
    if(!timeout) {
      success = true;
      callback();
    }
  };
  var fd = new FormData();
  fd.append('pictureData', blob, 'image.jpg');
  fd.append('id', 1)
  xhr.send(fd);
  setTimeout(function() {
    if(!success) {
      timeout = true;
      callback();
    }
  }, 3000);
}

function getBlob(callback) {
  var text = '';

  for(var i = 0; i<150000; i++) {
    text += 'f';
  }

  var blob = new Blob([text], {type: 'text/plain'});
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

  function sample() {
    var requests = 1;
    function test() {
      var size = blob.size;
      var bytesPerChunk = size / requests;
      var start = 0;
      var end = bytesPerChunk;
      var timeStart = Date.now();
      var n = 0;
      while(start < size) {
        request(blob.slice(start, end), function() {
          n++;
          if(n === requests) {
            samples++;
            if(samples <= sampleSize) {
              results.push(Date.now() - timeStart);
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
              document.querySelector('.table-body').appendChild(tr);
              results = [];
              samples = 0;
              requests++;
              test();
            }
          }
        });
        start = end;
        end = start + bytesPerChunk;
      }
    }
    test();
  }

  sample();

});


