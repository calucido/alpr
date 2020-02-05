const video = document.getElementById('video');
const button = document.getElementById('button');
const select = document.getElementById('select');
const canvas = document.getElementById('canvas');
let currentStream;

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function gotDevices(mediaDevices) {
  select.innerHTML = '';
  select.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
  setInterval(captureFrame, 10000);
}

button.addEventListener('click', event => {
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {
    facingMode: 'environment'
  };
  
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(error => {
      console.error(error);
    });
});

navigator.mediaDevices.enumerateDevices().then(gotDevices);

function captureFrame() {
  canvas.setAttribute('width', video.videoWidth);
  canvas.setAttribute('height', video.videoHeight);
  let context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  console.log(canvas.toDataURL('image/png'));

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '//192.168.0.100:8443', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(`img=${canvas.toDataURL('image/png')}`);
};    
