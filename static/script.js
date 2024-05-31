document.addEventListener("DOMContentLoaded", function() {
  let stream; // Store camera stream

  // Function to check if both language and capture image fields are filled
  function checkFields() {
      const language = document.getElementById("language").value;
      const imageContainer = document.getElementById("imageContainer").innerHTML;
      const submitButton = document.getElementById("submitButton");
      const errorMessage = document.getElementById("errorMessage");

      if (language && imageContainer) {
          submitButton.disabled = false;
          errorMessage.style.display = "none";
      } else {
          submitButton.disabled = true;
          errorMessage.style.display = "block";
      }
  }

  // Function to capture image
  function takePicture() {
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      const video = document.getElementById("cameraVideo");

      canvas.width = video.videoWidth-350;
      canvas.height = video.videoHeight-220;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log(canvas.width, canvas.height);
      // Convert captured image to data URL
      const dataUrl = canvas.toDataURL("image/jpeg");

      // Display captured image in image container
      const imageContainer = document.getElementById("imageContainer");
      imageContainer.innerHTML = `<img src="${dataUrl}" alt="Captured Image">`;

      // Check fields to enable/disable submit button
      checkFields();

      // Stop camera stream
      stream.getTracks().forEach(track => track.stop());

      // Hide camera container
      document.getElementById("cameraContainer").style.display = "none";
  }

  // Add event listener to capture button
  document.getElementById("captureButton").addEventListener("click", async function() {
      try {
          // Request permission to use the camera
          stream = await navigator.mediaDevices.getUserMedia({ video: true });

          // Display camera container
          const cameraContainer = document.getElementById("cameraContainer");
          cameraContainer.style.display = "block";

          // Display video stream in camera container
          const video = document.getElementById("cameraVideo");
          video.srcObject = stream;
      } catch (error) {
          console.error("Error accessing camera:", error);
      }
  });

  // Add event listener to capture image button
  document.getElementById("captureImageButton").addEventListener("click", takePicture);

  // Add event listener to submit button
  document.getElementById("submitButton").addEventListener("click", async function() {
      // Check if both language and image fields are filled
      const language = document.getElementById("language").value;
      const imageContainer = document.getElementById("imageContainer").innerHTML;

      if (!language || !imageContainer) {
          // Display error message if any of the fields are empty
          document.getElementById("errorMessage").style.display = "block";
      } else {
          // Convert captured image to Blob
          const canvas = document.getElementById("canvas");
          canvas.toBlob(async function(blob) {
              // Send the image blob to the backend for emotion detection
              await sendImageForEmotionDetection(blob, language);
          }, 'image/jpeg');
      }
  });

  // Add event listener to language selection
  document.getElementById("language").addEventListener("change", checkFields);

  // Function to send the captured image to the backend for emotion detection
  async function sendImageForEmotionDetection(imageData, language) {
      try {
          const formData = new FormData();
          formData.append('image', imageData);
          formData.append('language', language);
          const response = await fetch('/detect_emotion/', {
              method: 'POST',
              body: formData,
          });
          const data = await response.json();
          process.style.display='none';
          console.log('Detected Emotion:', data.emotion, data.path);
          
          // Display detected emotion
          const detectedEmotionDiv = document.getElementById("detectedEmotion");
          detectedEmotionDiv.textContent = `Detected Emotion: ${data.emotion}`;
          detectedEmotionDiv.style.display = "block";
          initializeMusicPlayer(data.path);
      } catch (error) {
          console.error('Error:', error);
      }
  }
});






function initializeMusicPlayer(songs) {
    // Show the body content once you have received the response from the backend
    // document.body.style.display = 'block';
    const musicPlayerContainer = document.querySelector('.music-player-container');
    musicPlayerContainer.style.display = 'block';
    console.log(songs);
  
  
    // Now you can continue with the rest of your JavaScript code
    const audioPlayer = document.getElementById('audioPlayer');
    const song = document.getElementById('song');
    
    // const volumeControl = document.getElementById('volumeControl');
    // const progressBar = document.getElementById('progressBar');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    let currentSongIndex = 0;
    
    
  
    function setVolume() {
      audioPlayer.volume = volumeControl.value;
    }
  

  
    function playNextSong() {
      if (currentSongIndex < songs.length - 1) {
          currentSongIndex++;
      } else {
          currentSongIndex = 0;
      }
      console.log(currentSongIndex);
      if (currentSongIndex >= 0 && currentSongIndex < songs.length) {
          audioPlayer.src = songs[currentSongIndex];
          console.log(songs[currentSongIndex]);
          const index = songs[currentSongIndex].indexOf("app -");

// Extract the substring after "app -"
        const songNameWithExtension = songs[currentSongIndex].substring(index + 6); // Adding 6 to skip "app -"

// Extract the song name without the file extension
        const songName = songNameWithExtension.substring(0, songNameWithExtension.lastIndexOf("."));
        song.innerHTML=songName;
        console.log(songName);

          audioPlayer.play();
      } else {
          console.error("Invalid song index:", currentSongIndex);
      }
  }
  
  function playPreviousSong() {
      if (currentSongIndex > 0) {
          currentSongIndex--;
      } else {
          currentSongIndex = songs.length - 1;
      }
  
      // Check if the current song index is valid
      if (currentSongIndex >= 0 && currentSongIndex < songs.length) {
          audioPlayer.src = songs[currentSongIndex];
          audioPlayer.play();
      } else {
          console.error("Invalid song index:", currentSongIndex);
      }
  }
  

    // playPauseButton.click();
    // audioPlayer.addEventListener('timeupdate', updateProgressBar);
    audioPlayer.addEventListener('ended', playNextSong);
    volumeControl.addEventListener('input', setVolume);
    nextButton.addEventListener('click', playNextSong);
    prevButton.addEventListener('click', playPreviousSong);
    nextButton.click();
  }
  
function handleButtonClick(){
  process.style.display='block';
  audioPlayer.pause();
  musicPlayerContainer.style.display = 'none';
  detected_emotion.style.display='none';

}

const musicPlayerContainer = document.querySelector('.music-player-container');
// Get the audio element by its id
var audioPlayer = document.getElementById('audioPlayer');

// Pause the audio

// Add event listener to the submit button
const detected_emotion = document.getElementById('detectedEmotion');
const process = document.getElementById('process');
const submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', handleButtonClick);
