from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt
import os
from ultralytics import YOLO
from dotenv import load_dotenv
from PIL import Image
import numpy as np
from werkzeug.utils import secure_filename
import re


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/mydatabase')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = './upload/input'
app.config['OUTPUT_FOLDER'] = './OUTPUT_FOLDER'
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "OUTPUT_FOLDER")


# model_path = r'/content/runs/train/weights/best.pt'
# if not os.path.exists(model_path):
#     raise FileNotFoundError(f"Model file not found at {model_path}")

# Load the YOLO model with your trained weights
model = YOLO('best50.pt')

# Initialize PyMongo
mongo = PyMongo(app)
users_collection = mongo.db.users

# Ensure upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/api/ping', methods=['POST'])
def ping_check():
    return jsonify({'status': 'ok', 'message': 'Server is ready'}), 200

def generate_token(user_id):
    """Generate JWT token for authentication"""
    token = jwt.encode({
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    return token

# @app.route('/api/register', methods=['POST'])
# def register():
    data = request.get_json()

    # Validate required fields
    required_fields = ['email', 'password', 'name']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if user already exists
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already registered'}), 409

    # Create new user
    try:
        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = {
            'email': data['email'],
            'password': hashed_password,
            'name': data['name'],
            'role': 'user',
            'created_at': datetime.utcnow()
        }
        result = users_collection.insert_one(new_user)
        print(result.inserted_id)
        # Generate token
        token = generate_token(result.inserted_id)
        print(result.inserted_id)

        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': {
                'id': str(result.inserted_id),
                'email': new_user['email'],
                'name': new_user['name'],
                'role': new_user['role']
            }
        }), 201

    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate required fields
    required_fields = ['email', 'password', 'name']
    if not all(field in data for field in required_fields):
        return jsonify({
            'success': False,
            'message': 'Missing required fields',
            'error': 'Required fields: email, password, name'
        }), 400

    try:
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 409

        # Create new user
        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = {
            'email': data['email'],
            'password': hashed_password,
            'name': data['name'],
            'role': 'user',
            'created_at': datetime.utcnow()
        }
        result = users_collection.insert_one(new_user)
        
        # Generate token
        token = generate_token(result.inserted_id)

        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'data': {
                'user': {
                    'id': str(result.inserted_id),
                    'email': new_user['email'],
                    'name': new_user['name'],
                    'role': new_user['role']
                },
                'token': token
            }
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Registration failed',
            'error': str(e)
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    # Find user
    user = users_collection.find_one({'email': data['email']})

    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Generate token
    token = generate_token(user['_id'])
    print(token)

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user['name'],
            'role': user['role']
        }
    }), 200

# @app.route('/api/verify-token', methods=['GET'])
# def verify_token():
#     auth_header = request.headers.get('Authorization')
    
#     if not auth_header or not auth_header.startswith('Bearer '):
#         return jsonify({'error': 'No token provided'}), 401

#     token = auth_header.split(' ')[1]

#     try:
#         # Decode and verify token
#         payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
#         print("verify_token: ",payload['user_id'])
#         user = users_collection.find_one({'_id': payload['user_id']})
        
#         if not user:
#             raise Exception('User not found')

#         return jsonify({
#             'valid': True,
#             'user': {
#                 'id': str(user['_id']),
#                 'email': user['email'],
#                 'name': user['name'],
#                 'role': user['role']
#             }
#         }), 200

#     except jwt.ExpiredSignatureError:
#         return jsonify({'error': 'Token has expired'}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({'error': 'Invalid token'}), 401
#     except Exception as e:
#         return jsonify({'error': str(e)}), 401

@app.route('/api/verify-token', methods=['GET'])
def verify_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401

    token = auth_header.split(' ')[1]  # Extract the token part
    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded_token.get('user_id')  # Extract the user ID from the token payload
        if not user_id:
            return jsonify({'error': 'Invalid token payload'}), 401
        return jsonify({'message': 'Token is valid', 'user_id': user_id}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    
def allowed_file(filename):
    """Check if the uploaded file is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Preprocess the image if necessary (e.g., resizing, normalization)
def preprocess_image(image, output_path=None):
    # Resize the image to match the input size expected by the model
    image = image.resize((640, 640))
    
    # Normalize pixel values (optional)
    image_array = np.array(image) / 255.0
    
    # If an output path is provided, save the resized image
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        image.save(output_path)
    
    return image_array

# @app.route('/api/upload', methods=['POST'])
# def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    print({"message": f"File {filename} uploaded successfully"})

    if file and allowed_file(file.filename):
        try:
            # Open the uploaded image
            image = Image.open(filepath)
            
            # Define the output path for the resized image
            resized_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'resized', filename)
            
            # Preprocess the image and save it
            preprocessed_image = preprocess_image(image, output_path=resized_image_path)
            
            # Run the YOLO model
            # Perform prediction using YOLO model
            results = model.predict(
                source=filepath,        # Path to the input file
                conf=0.25,              # Confidence threshold for predictions
                project='OUTPUT_FOLDER',  # Base directory for saving results
                save=True,              # Save annotated images
                save_conf=True ,
                save_txt = True         # Save confidence scores for detections
            )            
            # Save prediction outputs in the specified output folder
            output_files = [os.path.join('OUTPUT_FOLDER', filename) for filename in os.listdir('OUTPUT_FOLDER')]

            # Process the results (extract bounding boxes, classes, etc.)
            detections = results[0].boxes.data.tolist()  # Example: bounding boxes and confidence scores

            # # Draw the detections on the image and save it to the output folder
            # draw = ImageDraw.Draw(image)
            # for box in detections:
            #     x1, y1, x2, y2 = map(int, box[:4])  # Extract coordinates (assuming format is [x1, y1, x2, y2, ...])
            #     draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
            
            output_filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
            image.save(output_filepath)

            return jsonify({'detections': detections, 'output_image': output_filepath}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'message': 'No file part in the request',
            'error': 'File part missing'
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'success': False,
            'message': 'No file selected',
            'error': 'Empty filename'
        }), 400

    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Invalid file type'
            }), 400

        # Preprocess and run the YOLO model
        image = Image.open(filepath)
        resized_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'resized', filename)
        preprocess_image(image, output_path=resized_image_path)
        results = model.predict(
                source=filepath,        # Path to the input file
                conf=0.25,              # Confidence threshold for predictions
                project='OUTPUT_FOLDER',  # Base directory for saving results
                save=True,              # Save annotated images
                save_conf=True ,
                show = True,
                show_labels = True         # Save confidence scores for detections
            )  
        detections = results[0].boxes.data.tolist()  # Extract detection data
        results[0].show()
        output_filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        image.save(output_filepath)
        return jsonify({
            'success': True,
            'message': f'File {filename} processed successfully',
            'data': {
                'detections': detections,
                'output_image': os.path.join(app.config['OUTPUT_FOLDER'], filename)
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'File upload and processing failed',
            'error': str(e)
        }), 500

@app.route('/api/uploadFetch', methods=['GET'])
def fetch_uploaded_images():
    if request.method == 'OPTIONS':
        return '', 200  # Respond OK to preflight
    try:
        # Only include folders that match "predict<number>" pattern
        predict_folders = sorted(
            [folder for folder in os.listdir(OUTPUT_FOLDER) if re.match(r'^predict\d+$', folder)],
            key=lambda x: int(x.replace("predict", ""))
        )
        
        folder_data = []
        for folder in predict_folders:
            folder_path = os.path.join(OUTPUT_FOLDER, folder)
            if os.path.isdir(folder_path):
                files = [
                    {
                        "name": file,
                        "url": f"http://localhost:5000/api/OUTPUT_FOLDER/{folder}/{file}"
                    }
                    for file in os.listdir(folder_path)
                    if os.path.isfile(os.path.join(folder_path, file))
                ]
                folder_data.append({"folder": folder, "files": files})
        return jsonify({"success": True, "data": folder_data})
    except Exception as e:
        print(f"Error fetching uploads: {e}")
        return jsonify({"success": False, "error": "Failed to fetch uploads"}), 500
        # if request.method == 'OPTIONS':
        #     return '', 200  # Respond OK to preflight
        # try:
        #     predict_folders = sorted(
        #         [folder for folder in os.listdir(OUTPUT_FOLDER) if folder.startswith("predict")],
        #         key=lambda x: int(x.replace("predict", ""))
        #     )
        #     folder_data = []
        #     for folder in predict_folders:
        #         folder_path = os.path.join(OUTPUT_FOLDER, folder)
        #         if os.path.isdir(folder_path):
        #             files = [
        #                 {"name": file, "path": f"/OUTPUT_FOLDER/{folder}/{file}"}
        #                 for file in os.listdir(folder_path)
        #                 if os.path.isfile(os.path.join(folder_path, file))
        #             ]
        #             folder_data.append({"folder": folder, "files": files})
        #     return jsonify({"success": True, "data": folder_data})
        # except Exception as e:
            # print(f"Error fetching uploads: {e}")
            # return jsonify({"success": False, "error": "Failed to fetch uploads"}), 500

# @app.route('/api/fetchUploads', methods=['GET','OPTIONS'])
# def fetch_uploads():
#     if request.method == 'OPTIONS':
#         return '', 200  # Respond OK to preflight
#     try:
#         predict_folders = sorted(
#             [folder for folder in os.listdir(OUTPUT_FOLDER) if folder.startswith("predict")],
#             key=lambda x: int(x.replace("predict", ""))
#         )
#         folder_data = []
#         for folder in predict_folders:
#             folder_path = os.path.join(OUTPUT_FOLDER, folder)
#             if os.path.isdir(folder_path):
#                 files = [
#                     {"name": file, "path": f"/uploads/{folder}/{file}"}
#                     for file in os.listdir(folder_path)
#                     if os.path.isfile(os.path.join(folder_path, file))
#                 ]
#                 folder_data.append({"folder": folder, "files": files})
#         return jsonify({"success": True, "data": folder_data})
#     except Exception as e:
#         print(f"Error fetching uploads: {e}")
#         return jsonify({"success": False, "error": "Failed to fetch uploads"}), 500


@app.route('/api/OUTPUT_FOLDER/<folder>/<filename>', methods=['GET'])
def serve_file(folder, filename):
    # Construct the full path and validate it
    folder_path = os.path.abspath(os.path.join(OUTPUT_FOLDER, folder))
    if not folder_path.startswith(os.path.abspath(OUTPUT_FOLDER)):
        return jsonify({"success": False, "error": "Access denied"}), 403

    file_path = os.path.join(folder_path, filename)
    if os.path.exists(file_path):
        print(f"Serving file from: {file_path}")
        return send_from_directory(folder_path, filename)
    else:
        return jsonify({"success": False, "error": "File not found"}), 404

@app.route('/api/live-mode', methods=['POST'])
def live_mode():
    # Add logic to start YOLOv11 in live mode
    # For example, trigger the camera and load the model
    try:
        # Use live camera as source with streaming enabled
        results = model(source=0, conf=0.75, show=True)  # '0' refers to the default webcam
            
        # Process results generator
        for result in results:
            boxes = result.boxes  # Boxes object for bounding box outputs
            masks = result.masks  # Masks object for segmentation masks outputs
            keypoints = result.keypoints  # Keypoints object for pose outputs
            probs = result.probs  # Probs object for classification outputs
            obb = result.obb  # Oriented boxes object for OBB outputs
            result.show()  # display to screen
            # result.save(filename="result.jpg")  # save to disk

        return jsonify({"success": True, "message": "Live mode running!"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
  
if __name__ == '__main__':
    app.run(debug=True)
