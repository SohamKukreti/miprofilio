import requests
import json

def get_user_profile_with_stats(username):
    url = "https://leetcode.com/graphql"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"  # Helps to mimic a real browser
    }
    
    # GraphQL query to get both profile details and submission stats
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
    payload = {
        "query": query,
        "variables": variables
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Query failed with status code {response.status_code}")

if __name__ == "__main__":
    target_username = "kukretisoham"  # Replace with the target LeetCode username
    profile_data = get_user_profile_with_stats(target_username)
    
    # Pretty-print the full JSON response
    print("Full profile JSON:")
    print(json.dumps(profile_data, indent=2))
    
    # Extract and display the problem counts by difficulty
    try:
        submission_stats = profile_data["data"]["matchedUser"]["submitStats"]["acSubmissionNum"]
        stats = {entry["difficulty"]: entry["count"] for entry in submission_stats}
        print("\nNumber of problems solved:")
        print("Easy:   ", stats.get("Easy", 0))
        print("Medium: ", stats.get("Medium", 0))
        print("Hard:   ", stats.get("Hard", 0))
    except KeyError:
        print("Could not retrieve submission statistics.")
