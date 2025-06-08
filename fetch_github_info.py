import requests

def get_github_user_data(token=None):

    GITHUB_API = "https://api.github.com"
    PER_PAGE = 1000

    USERNAME = input("Enter your GitHub username: ").strip()
    username = USERNAME

    with open('github_token.txt', 'r') as f:
        token = f.read().strip()
    """
    Fetches and prints comprehensive public data for a given GitHub username.

    Args:
        username (str): The GitHub username to fetch data for.
        token (str, optional): A personal access token for authenticated requests
                               to avoid rate limiting and access public data
                               more reliably. Defaults to None.
    """

    def github_api_get(url, token=None, params=None):
        headers = {}
        if token:
            headers['Authorization'] = f'token {token}'
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching {url}: {response.status_code} {response.text}")
            return None

    def fetch_all_pages(url, token=None, params=None):
        all_items = []
        page = 1
        while True:
            p = params.copy() if params else {}
            p.update({'per_page': PER_PAGE, 'page': page})
            data = github_api_get(url, token, p)
            if not data:
                break
            all_items.extend(data)
            if len(data) < PER_PAGE:
                break
            page += 1
        return all_items

    # Data fetching functions (nested to keep them within the scope of get_github_user_data)
    def fetch_user_profile(username, token=None):
        url = f"{GITHUB_API}/users/{username}"
        return github_api_get(url, token)

    def fetch_repos(username, token=None):
        url = f"{GITHUB_API}/users/{username}/repos"
        return fetch_all_pages(url, token)

    def fetch_commits(owner, repo, token=None):
        url = f"{GITHUB_API}/repos/{owner}/{repo}/commits"
        return fetch_all_pages(url, token)

    def fetch_orgs(username, token=None):
        url = f"{GITHUB_API}/users/{username}/orgs"
        return github_api_get(url, token)

    def fetch_gists(username, token=None):
        url = f"{GITHUB_API}/users/{username}/gists"
        return fetch_all_pages(url, token)

    def fetch_events(username, token=None):
        url = f"{GITHUB_API}/users/{username}/events"
        return fetch_all_pages(url, token)

    def fetch_languages(owner, repo, token=None):
        url = f"{GITHUB_API}/repos/{owner}/{repo}/languages"
        return github_api_get(url, token)

    def fetch_branches(owner, repo, token=None):
        url = f"{GITHUB_API}/repos/{owner}/{repo}/branches"
        return github_api_get(url, token)

    # Main logic moved inside the function
    profile = fetch_user_profile(username, token)
    if not profile:
        print(f"Failed to get user profile for {username}.")
        return

    print(f"--- Profile for {username} ---")
    for k in ['login', 'id', 'name', 'company', 'blog', 'location', 'email', 'bio', 'twitter_username', 'public_repos',
              'followers', 'following', 'created_at']:
        print(f"{k}: {profile.get(k)}")

    print("\n--- Organizations ---")
    orgs = fetch_orgs(username, token) or []
    if orgs:
        for org in orgs:
            print(f"- {org.get('login')} ({org.get('description')})")
    else:
        print("No public organizations found.")

    print("\n--- Public Repositories ---")
    repos = fetch_repos(username, token) or []
    if repos:
        for repo in repos:
            print(f"\nRepo: {repo.get('name')}")
            print(f"  Description: {repo.get('description')}")
            print(f"  URL: {repo.get('html_url')}")
            print(f"  Language: {repo.get('language')}")
            print(f"  Stars: {repo.get('stargazers_count')}")
            print(f"  Forks: {repo.get('forks_count')}")
            print(f"  Open Issues: {repo.get('open_issues_count')}")
            print(f"  Created at: {repo.get('created_at')}")
            print(f"  Updated at: {repo.get('updated_at')}")
            print(f"  Default Branch: {repo.get('default_branch')}")

            # Languages breakdown
            languages = fetch_languages(username, repo.get('name'), token)
            if languages:
                print("  Languages breakdown:")
                for lang, bytes_count in languages.items():
                    print(f"    {lang}: {bytes_count} bytes")
            else:
                print("  No language breakdown available.")

            # Branches
            branches = fetch_branches(username, repo.get('name'), token)
            if branches:
                branch_names = [b['name'] for b in branches]
                print(f"  Branches: {', '.join(branch_names)}")
            else:
                print("  No branches found.")

            # Recent commits (limit to 5 latest)
            commits = fetch_commits(username, repo.get('name'), token)
            if commits:
                print("  Latest commits:")
                for c in commits[:5]:
                    sha = c.get('sha')
                    message = c.get('commit', {}).get('message', '').split('\n')[0]
                    date = c.get('commit', {}).get('author', {}).get('date')
                    print(f"    {sha[:7]}: {message} ({date})")
            else:
                print("  No commits found.")
    else:
        print("No public repositories found.")

    print("\n--- Public Gists ---")
    gists = fetch_gists(username, token) or []
    if gists:
        for gist in gists:
            print(f"- {gist.get('html_url')}: {gist.get('description') or 'No description'}")
    else:
        print("No public gists found.")

    print("\n--- Recent Public Events ---")
    events = fetch_events(username, token) or []
    if events:
        for event in events[:10]:  # show latest 10 events
            repo_name = event.get('repo', {}).get('name', 'N/A')
            print(f"- {event.get('type')} at {event.get('created_at')} in repo {repo_name}")
    else:
        print("No recent public events found.")

get_github_user_data()