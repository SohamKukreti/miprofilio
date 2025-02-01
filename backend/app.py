from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)
# --------------------
# LeetCode Scraper Code
# --------------------
def get_user_profile_with_stats(username):
    url = "https://leetcode.com/graphql"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"  # Helps to mimic a real browser
    }
    query = """
    query getUserProfileWithStats($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          aboutMe
          reputation
          solutionCount
          postViewCount
          ranking
          countryName
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
    """
    variables = {"username": username}
    payload = {"query": query, "variables": variables}
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"LeetCode query failed with status code {response.status_code}"}


# --------------------
# GitHub Scraper Code
# --------------------
def get_github_profile(username):
    url = f"https://api.github.com/users/{username}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"GitHub profile request failed with status code {response.status_code}"}

def get_github_repos(username):
    url = f"https://api.github.com/users/{username}/repos"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"GitHub repos request failed with status code {response.status_code}"}


# --------------------
# API Endpoints
# --------------------
@app.route('/api/leetcode/<username>', methods=['GET'])
def leetcode(username):
    data = get_user_profile_with_stats(username)
    return jsonify(data)

@app.route('/api/github/<username>', methods=['GET'])
def github(username):
    profile = get_github_profile(username)
    repos = get_github_repos(username)
    return jsonify({
        "profile": profile,
        "repos": repos
    })

# Optionally serve a simple homepage
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
