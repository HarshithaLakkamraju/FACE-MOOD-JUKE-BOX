document.addEventListener("DOMContentLoaded", function() {
    let stream; // Store camera stream

    // Function to check if both language and capture image fields are filled
    function checkFields() {
        const language = document.getElementById("language").value;
        console.log(language)
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

    // Add event listener to upload image button
    document.getElementById("uploadButton").addEventListener("click", function() {
        // Trigger click event on file input element
        document.getElementById("fileInput").click();
    });

    // Add event listener to file input element
    document.getElementById("fileInput").addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                // Display uploaded image in image container
                const imageContainer = document.getElementById("imageContainer");
                imageContainer.innerHTML = `<img src="${reader.result}" alt="Uploaded Image">`;

                // Check fields to enable/disable submit button
                checkFields();
            };
            reader.readAsDataURL(file);
        }
    });

    // Add event listener to reset button
    document.getElementById("resetButton").addEventListener("click", function() {
        // Reset all fields and elements
        document.getElementById("language").value = "";
        document.getElementById("imageContainer").innerHTML = "";
        document.getElementById("submitButton").disabled = true;
        document.getElementById("errorMessage").style.display = "none";
        document.getElementById("detectedEmotion").style.display = "none";
        var audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.pause();
        document.getElementById("music").style.display = "none";
    });

    // Add event listner to submit button
    document.getElementById("submitButton").addEventListener("click", async function() {
    // Check if language field is filled
    const language = document.getElementById("language").value;

    if (!language) {
        // Display error message if language field is empty
        document.getElementById("errorMessage").style.display = "block";
        return; // Exit the function if language field is empty
    }

    // Check if an image is uploaded
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files[0]) {
        // If image is uploaded, use the uploaded image data
        const imageData = fileInput.files[0];
        sendImageForEmotionDetection(imageData);
    } else {
        // If no image is uploaded, check if a captured image is available
        const canvas = document.getElementById("canvas");
        const imageContainer = document.getElementById("imageContainer");
        if (canvas && imageContainer.innerHTML) {
            // If a captured image is available, convert it to Blob
            canvas.toBlob(blob => {
                // Send the captured image data to the backend for emotion detection
                sendImageForEmotionDetection(blob);
            }, 'image/jpeg');
        } else {
            // Display error message if no image is uploaded or captured
            document.getElementById("errorMessage").style.display = "block";
        }
    }
});


    // Add event listener to language selection
    document.getElementById("language").addEventListener("change", checkFields);
   

    // Function to send the image data to the backend for emotion detection
    async function sendImageForEmotionDetection(imageData) {
        try {
            const language = document.getElementById("language").value;
            const formData = new FormData();
            formData.append('image', imageData);
            formData.append('language', language);
            const response = await fetch('/detect_emotion/', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('Detected Emotion:', data.emotion, data.path);
            process.style.display='none';
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
    // alert(songs);
  
    // Now you can continue with the rest of your JavaScript code
    const audioPlayer = document.getElementById('audioPlayer');
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
