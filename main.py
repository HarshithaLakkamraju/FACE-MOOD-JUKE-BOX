from starlette.responses import FileResponse
import io
import os, re
from fastapi.staticfiles import StaticFiles
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException, Response, Form
from fastapi.middleware.cors import CORSMiddleware
import PIL.Image

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Add OPTIONS method
    allow_headers=["*"],
)

@app.get("/")
async def get_index():
    return FileResponse("index1.html")


# Configure Google API key
# GOOGLE_API_KEY = "AIzaSyAHaL4BHo_77l17oDcNjvlGJEIZgjsjSyE"
GOOGLE_API_KEY = "AIzaSyBA5Cl8rUgpJ2Oi2zltb7MKBK-Rsudz4_8"


genai.configure(api_key=GOOGLE_API_KEY)

# Load the emotion detection model
model = genai.GenerativeModel("gemini-pro-vision")


def imagePaths(emotion, language):
    base_dir = "static/audio"  # Base directory
    emotion_dir = os.path.join(base_dir, language)  # Default directory for emotion
    file_paths = []  # List to store file paths
    
    try:
        # Check if any emotion in the list is a substring of the provided emotion
        emotions_list = ['happy', 'sad', 'angry', 'disgust', 'surprise', 'neutral', 'fear']
        for em in emotions_list:
            if em.lower() in emotion.lower():
                emotion_dir = os.path.join(emotion_dir, em.lower())
                break
        print(emotion_dir)
        # Check if the directory exists
        if os.path.exists(emotion_dir):
            # Walk through the directory structure to find files
            for root, dirs, files in os.walk(emotion_dir):
                for file in files:
                    file_paths.append(os.path.join(root, file))  # Append file path to the list
    except FileNotFoundError:
        # If the emotion directory doesn't exist, return an empty list
        return []

    return file_paths


@app.post("/detect_emotion/")
async def detect_emotion(image: UploadFile = File(...),  language: str = Form(...)):
    # Read the image file
    print("123", language)
    contents = await image.read()
    image = PIL.Image.open(io.BytesIO(contents))

    # Perform emotion detection
    model = genai.GenerativeModel("gemini-pro-vision")
    response = model.generate_content(
    ["""Detect the emotion of the person in the image, emtion must be from this list of emotions [Happy, Sad, Angry, Disgust, Surprise, Neutral, Fear]. Only return the emotion, don't give any extra content.
      Don't say any other emotion which is not in the given list. Must detect any of the emotion provided in the list only.
      Don't give extra content like "the emotion of the persion is...". Just give the detected emotion.
      Don't say undefined emotion or don't give any other emotion which is not in the provided list.
      If human face is there must match it with any one of the given emotion.
      If image doesnot contain any human face just say it is not a human image.
      Strictly you must return only one of the emotions which is in list of emotions. Strictly Don't generate extra contxent along with the emotion.
      Ex: "The emotion of the person in the image is 'Surprise'." Don't generate like this just say "Surprise".""", image]  
)
    response.resolve()
    detected_emotion = response.parts[0].text.strip()
    print(detected_emotion)
    print(language)
    # imagePaths(detected_emotion, language)

    return {"emotion": detected_emotion, "path": imagePaths(detected_emotion, language)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
