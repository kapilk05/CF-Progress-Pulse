import requests
import time

def getContestStandings(contestID):
    url = f"https://codeforces.com/api/contest.ratingChanges?contestId={contestID}"
    response = requests.get(url)
    try:
        data = response.json()
    except requests.exceptions.JSONDecodeError as e:
        print(f"Error decoding JSON from {url}: {e}")
        print(f"Response content: {response.text}")
        return None
    return data

def getUserInfo(url):
    print(url)
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

def printDetails(user, data, last):
    print(f"Handle: {user['handle']}")
    if "firstName" in user: print(f"First Name: {user['firstName']}")
    if "lastName" in user: print(f"Last Name: {user['lastName']}")
    print(f"Old Rating: {data[last]['oldRating']}")
    print(f"New Rating: {data[last]['newRating']}")

def makeRequest(userList, end):
    url = "https://codeforces.com/api/user.info?handles="
    for i in range(end):
        url += userList[i] + ";"

    url = url[:-1]
    url += "&checkHistoricHandles=false"
    time.sleep(3)
    response = getUserInfo(url)
    return response

def getUsersFromOrg(userList, orgName):
    url = "https://codeforces.com/api/user.info?handles="
    count = 0
    djusers = []
    a = []
    for userName in userList:
        count += 1
        url += userName[0] + ";"
        a.append(userName[0])
        if count < 69: continue

        url = url[:-1]
        url += "&checkHistoricHandles=false"

        time.sleep(3)
        response = getUserInfo(url)

        if response == None:
            print("Response Received is None in getting users from org")
            left = 0
            right = len(a) - 1
            while left < right:
                half = (left + right) // 2

                response = makeRequest(a, half + 1)

                if response == None: right = half
                else: left = half + 1

            response = makeRequest(a, left)
            print(left)
        
        try:
            data = response.json()
            for user in data["result"]:
                if "organization" not in user: continue
                if user["organization"] != orgName: continue
                djusers.append(user)
                
        except requests.exceptions.JSONDecodeError as e:
            print(f"Error decoding JSON from {url}: {e}")
            print(f"Response content: {response.text}")
            exit(1)
        
        url = "https://codeforces.com/api/user.info?handles="
        count = 0
        a = []

    return djusers

def firstTimers(userList, contestID):
    for user in userList:
        if user["rating"] < user["maxRating"]: continue

        time.sleep(2)
        url = f"https://codeforces.com/api/user.rating?handle={user['handle']}"
        response = requests.get(url)

        if response == None:
            print("Response received is none in getting user rating")
            exit(1)
        
        try:
            time.sleep(2)
            data = response.json()["result"]

            maxi = 0
            last = 0
            for i in range(len(data)):
                if data[i]["contestId"] == contestID: break
                maxi = max(maxi, data[i]["newRating"])
                last = i + 1
            oldRating = giveCharacterBasedOnRating(maxi)
            newRating = giveCharacterBasedOnRating(data[last]["newRating"])
            if ord(oldRating) == ord(newRating): continue
            if last == 0: print("\nFirst Time")
            else: print("\nColor Upgrade")
            printDetails(user, data, last)

        except requests.exceptions.JSONDecodeError as e:
            print(f"Error decoding JSON from {url}: {e}")
            print(f"Response content: {response.text}")
            exit(1)


contestID = int(input("Contest ID: "))
standings = getContestStandings(contestID)
if standings is None:
    print("Failed to get contest standings.")
    exit(1)

checkOrgList = []
count = 0
for user in standings.get('result', []):
    count += 1
    oldRating = giveCharacterBasedOnRating(user["oldRating"])
    newRating = giveCharacterBasedOnRating(user["newRating"])
    if ord(oldRating) >= ord(newRating): continue
    checkOrgList.append([user["handle"], user["oldRating"], user["newRating"]])

usersFromOrg = getUsersFromOrg(checkOrgList, "Dwarkadas J. Sanghvi College of Engineering")
print("\n\n\n\n")
print(*usersFromOrg)
print("\n\n\n\n")
firstTimers(usersFromOrg, contestID)