from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS
import requests
import time
from datetime import datetime

app = Flask(__name__)

# Enable CORS for all origins and credentials
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# --- Configurations ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'

# --- Initialize extensions ---
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    accounts = db.relationship('Account', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.String(50), nullable=False)
    handle = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create DB tables
with app.app_context():
    db.create_all()

# --- Authentication APIs ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    leetcode = data.get('leetcode_profile')

    if not email or not password:
        return jsonify({'msg': 'Email and password required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'User already exists'}), 400

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    if leetcode:
        leetcode_account = Account(platform='leetcode', handle=leetcode, user_id=user.id)
        db.session.add(leetcode_account)
        db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'msg': 'User created successfully', 'access_token': access_token}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token})

# --- Linked Accounts APIs ---
@app.route('/api/accounts', methods=['POST'])
@jwt_required()
def add_account():
    user_id = get_jwt_identity()
    data = request.get_json()
    platform = data.get('platform')
    handle = data.get('handle')
    if not platform or not handle:
        return jsonify({'msg': 'Platform and handle required'}), 400

    existing = Account.query.filter_by(user_id=user_id, platform=platform, handle=handle).first()
    if existing:
        return jsonify({'msg': 'Account already added'}), 400

    account = Account(platform=platform, handle=handle, user_id=user_id)
    db.session.add(account)
    db.session.commit()
    return jsonify({'msg': 'Account added successfully'}), 201

@app.route('/api/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    result = []
    for acc in accounts:
        result.append({
            'platform': acc.platform,
            'handle': acc.handle,
            'added_at': acc.created_at.isoformat()
        })
    return jsonify({'accounts': result})

# --- Contest Pulse Logic ---
def getContestStandings(contestID):
    url = f"https://codeforces.com/api/contest.ratingChanges?contestId={contestID}"
    response = requests.get(url)
    try:
        return response.json()
    except requests.exceptions.JSONDecodeError as e:
        print(f"Error decoding JSON from {url}: {e}")
        return None

def getUserInfo(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error: Received status code {response.status_code} from {url}")
        return None
    return response

def giveCharacterBasedOnRating(rating):
    if rating == 0: return "9"
    if rating < 1200: return "A"
    elif rating < 1400: return "B"
    elif rating < 1600: return "C"
    elif rating < 1900: return "D"
    elif rating < 2100: return "E"
    elif rating < 2300: return "F"
    elif rating < 2400: return "G"
    elif rating < 2600: return "H"
    elif rating < 3000: return "I"
    else: return "J"

def makeRequest(userList, end):
    url = "https://codeforces.com/api/user.info?handles="
    url += ";".join(userList[:end])
    url += "&checkHistoricHandles=false"
    time.sleep(3)
    return getUserInfo(url)

def getUsersFromOrg(userList, orgName):
    url = "https://codeforces.com/api/user.info?handles="
    count = 0
    djusers = []
    a = []

    for userName in userList:
        count += 1
        url += userName[0] + ";"
        a.append(userName[0])
        if count < 69:
            continue

        url = url[:-1] + "&checkHistoricHandles=false"
        time.sleep(3)
        response = getUserInfo(url)

        if response is None:
            left, right = 0, len(a) - 1
            while left < right:
                half = (left + right) // 2
                response = makeRequest(a, half + 1)
                if response is None:
                    right = half
                else:
                    left = half + 1
            response = makeRequest(a, left)

        try:
            data = response.json()
            for user in data["result"]:
                if "organization" in user and user["organization"] == orgName:
                    djusers.append(user)
        except Exception as e:
            print(f"Error processing user info: {e}")

        url = "https://codeforces.com/api/user.info?handles="
        count = 0
        a = []

    return djusers

def firstTimers(userList, contestID):
    upgraded_users = []
    for user in userList:
        if user["rating"] < user["maxRating"]:
            continue

        url = f"https://codeforces.com/api/user.rating?handle={user['handle']}"
        try:
            response = requests.get(url)
            time.sleep(2)
            data = response.json()["result"]

            maxi = 0
            last = 0
            for i in range(len(data)):
                if data[i]["contestId"] == contestID:
                    break
                maxi = max(maxi, data[i]["newRating"])
                last = i + 1

            oldRating = giveCharacterBasedOnRating(maxi)
            newRating = giveCharacterBasedOnRating(data[last]["newRating"])
            if ord(oldRating) == ord(newRating):
                continue

            upgraded_users.append({
                "handle": user["handle"],
                "oldRating": data[last]["oldRating"],
                "newRating": data[last]["newRating"],
                "colorChange": f"{oldRating} → {newRating}"
            })

        except Exception as e:
            print(f"Error processing rating for {user['handle']}: {e}")
            continue

    return upgraded_users

@app.route("/api/pulse", methods=["POST"])
def pulse():
    try:
        req_data = request.get_json()
        contestID = req_data.get("contestId")
        if not contestID:
            return jsonify({"status": "error", "message": "Missing contestId"}), 400

        standings = getContestStandings(contestID)
        if standings is None or standings.get("status") != "OK":
            return jsonify({"status": "error", "message": "Could not fetch contest standings"}), 500

        checkOrgList = []
        for user in standings.get('result', []):
            oldRating = giveCharacterBasedOnRating(user["oldRating"])
            newRating = giveCharacterBasedOnRating(user["newRating"])
            if ord(oldRating) >= ord(newRating):
                continue
            checkOrgList.append([user["handle"], user["oldRating"], user["newRating"]])

        usersFromOrg = getUsersFromOrg(checkOrgList, "Dwarkadas J. Sanghvi College of Engineering")
        result = firstTimers(usersFromOrg, contestID)

        return jsonify({"status": "success", "data": result})

    except Exception as e:
        print(f"Exception in /api/pulse: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/test')
def test():
    return "API is working"

@app.route('/api/current_user', methods=['GET'])
@jwt_required()
def current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.email.split('@')[0].capitalize(),
            'avatarUrl': f'https://api.dicebear.com/7.x/bottts/svg?seed={user.email}'
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
