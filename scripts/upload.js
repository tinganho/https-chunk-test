function request(blob, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/pictures', true);
  xhr.setRequestHeader('Response-Type', 'application/form-data');
  xhr.onload = function(e) {
    callback();
  };
  var fd = new FormData();
  fd.append('pictureData', blob, 'image.jpg');
  fd.append('id', 1)
  xhr.send(fd);
}

function getImage(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/images/test.jpg', true);
  xhr.responseType = 'blob';

  xhr.onload = function(e) {
    if (this.status == 200) {
      var blob = new Blob([this.response], {type: 'image/jpeg'});
      callback(blob);
    }
  };
  xhr.send();
}

getImage(function(blob) {
  var requests = 1;
  var maxRequests = 10;
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
          var tr = document.createElement('tr');
          var td = document.createElement('td');
          td.innerHTML = requests;
          tr.appendChild(td);
          var td = document.createElement('td');
          td.innerHTML = Date.now() - timeStart;
          tr.appendChild(td);
          document.querySelector('.table-body').appendChild(tr);
          requests++;
          if(requests <= maxRequests) {
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


