import requests
import json

def get_github_profile(username):
    """
    Fetches the GitHub profile details for a given username.
    """
    url = f"https://api.github.com/users/{username}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0"  # Mimic a browser to avoid request blocking
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Request failed with status code {response.status_code}")

def get_github_repos(username):
    """
    Fetches a list of public repositories for a given GitHub username.
    """
    url = f"https://api.github.com/users/{username}/repos"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Request failed with status code {response.status_code}")

if __name__ == "__main__":
    # Replace 'octocat' with the target GitHub username
    username = "SohamKukreti"
    
    # Fetch and print the GitHub profile details
    try:
        profile = get_github_profile(username)
        print("GitHub Profile:")
        print(json.dumps(profile, indent=2))
    except Exception as e:
        print(f"Error fetching profile: {e}")
    
    # Fetch and print the list of public repositories
    try:
        repos = get_github_repos(username)
        print("\nPublic Repositories:")
        for repo in repos:
            print(f"- {repo['name']}: {repo['html_url']}")
    except Exception as e:
        print(f"Error fetching repositories: {e}")
