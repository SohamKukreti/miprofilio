from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

load_dotenv()

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
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
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
# GeeksforGeeks Scraper Code
# --------------------
def get_geeks_profile(username):
    # Assume the GeeksforGeeks profile URL follows this pattern.
    url = f"https://auth.geeksforgeeks.org/user/{username}/"
    response = requests.get(url)
    print(response.text)
    if response.status_code != 200:
        return {"error": f"GeeksforGeeks profile request failed with status code {response.status_code}"}
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # The following selectors are examples.
    # Inspect the GeeksforGeeks profile page to update these selectors accordingly.
    name_elem = soup.find("h1", class_="profile-name")
    stats_div = soup.find("div", class_="profile-stats")
    stats = {}
    if stats_div:
        # Assume each stat is within a span with class "stat" and in the format "Key: Value"
        for span in stats_div.find_all("span", class_="stat"):
            text = span.get_text(strip=True)
            if ":" in text:
                key, value = text.split(":", 1)
                stats[key.strip()] = value.strip()
    
    return {
        "username": username,
        "name": name_elem.get_text(strip=True) if name_elem else None,
        "stats": stats
    }

# --------------------
# Gemini AI Summary Function
# --------------------
def get_ai_summary(github_username, leetcode_username):
    # Fetch GitHub and LeetCode data
    github_data = {
        "profile": get_github_profile(github_username),
        "repos": get_github_repos(github_username)
    }
    leetcode_data = get_user_profile_with_stats(leetcode_username)
    
    # Build a prompt string using the aggregated data
    prompt = "Generate a concise AI summary for the following user profile:\n\n"
    prompt += "GitHub Profile:\n"
    prompt += f"Username: {github_data['profile'].get('login')}\n"
    prompt += f"Name: {github_data['profile'].get('name')}\n"
    prompt += f"Company: {github_data['profile'].get('company')}\n"
    prompt += f"Location: {github_data['profile'].get('location')}\n"
    prompt += f"Bio: {github_data['profile'].get('bio')}\n"
    prompt += f"Followers: {github_data['profile'].get('followers')}, Repos: {github_data['profile'].get('public_repos')}\n"
    prompt += "Repositories (sample): " + ", ".join([repo.get('name') for repo in github_data['repos'][:5]]) + "\n\n"
    
    prompt += "LeetCode Profile:\n"
    matched_user = leetcode_data.get("data", {}).get("matchedUser", {})
    if matched_user:
        profile = matched_user.get("profile", {})
        prompt += f"Username: {matched_user.get('username')}\n"
        prompt += f"Rank: {profile.get('ranking')}, Reputation: {profile.get('reputation')}\n"
        prompt += f"Solutions: {profile.get('solutionCount')}, Country: {profile.get('countryName')}\n"
        prompt += "Submission Stats: " + ", ".join(
            [f"{entry.get('difficulty')}: {entry.get('count')}" for entry in matched_user.get("submitStats", {}).get("acSubmissionNum", [])]
        ) + "\n"
        # Skills and topics
        tag_counts = matched_user.get("tagProblemCounts", {})
        if tag_counts:
            for level, tags in tag_counts.items():
                prompt += f"{level.capitalize()} Skills: " + ", ".join(
                    [f"{tag.get('tagName')} ({tag.get('problemsSolved')})" for tag in tags]
                ) + "\n"
    else:
        prompt += "No LeetCode data available.\n"
    
    prompt += "\nProvide a concise summary highlighting key metrics and overall strengths."

    # Call the Gemini API using google.generativeai
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    # Extract text from the response:
    summary_text = response.result.candidates[0].content.parts[0].text
    return summary_text

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

@app.route('/api/geeks/<username>', methods=['GET'])
def geeks(username):
    data = get_geeks_profile(username)
    return jsonify(data)

@app.route('/api/ai_summary/<github_username>/<leetcode_username>', methods=['GET'])
def ai_summary(github_username, leetcode_username):
    summary = get_ai_summary(github_username, leetcode_username)
    return jsonify({"summary": summary})

# Optionally serve a simple homepage
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
