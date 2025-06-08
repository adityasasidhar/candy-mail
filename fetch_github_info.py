import requests

def get_github_user_data(token=None):
    GITHUB_API = "https://api.github.com"
    PER_PAGE = 1000
    output = ""

    USERNAME = input("Enter your GitHub username: ").strip()
    username = USERNAME

    with open('github_token.txt', 'r') as f:
        token = f.read().strip()

    def github_api_get(url, token=None, params=None):
        headers = {}
        if token:
            headers['Authorization'] = f'token {token}'
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        else:
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

    profile = fetch_user_profile(username, token)
    if not profile:
        return f"Failed to get user profile for {username}."

    output += f"--- Profile for {username} ---\n"
    for k in ['login', 'id', 'name', 'company', 'blog', 'location', 'email', 'bio', 'twitter_username', 'public_repos',
              'followers', 'following', 'created_at']:
        output += f"{k}: {profile.get(k)}\n"

    output += "\n--- Organizations ---\n"
    orgs = fetch_orgs(username, token) or []
    if orgs:
        for org in orgs:
            output += f"- {org.get('login')} ({org.get('description')})\n"
    else:
        output += "No public organizations found.\n"

    output += "\n--- Public Repositories ---\n"
    repos = fetch_repos(username, token) or []
    if repos:
        for repo in repos:
            output += f"\nRepo: {repo.get('name')}\n"
            output += f"  Description: {repo.get('description')}\n"
            output += f"  URL: {repo.get('html_url')}\n"
            output += f"  Language: {repo.get('language')}\n"
            output += f"  Stars: {repo.get('stargazers_count')}\n"
            output += f"  Forks: {repo.get('forks_count')}\n"
            output += f"  Open Issues: {repo.get('open_issues_count')}\n"
            output += f"  Created at: {repo.get('created_at')}\n"
            output += f"  Updated at: {repo.get('updated_at')}\n"
            output += f"  Default Branch: {repo.get('default_branch')}\n"

            languages = fetch_languages(username, repo.get('name'), token)
            if languages:
                output += "  Languages breakdown:\n"
                for lang, bytes_count in languages.items():
                    output += f"    {lang}: {bytes_count} bytes\n"
            else:
                output += "  No language breakdown available.\n"

            branches = fetch_branches(username, repo.get('name'), token)
            if branches:
                branch_names = [b['name'] for b in branches]
                output += f"  Branches: {', '.join(branch_names)}\n"
            else:
                output += "  No branches found.\n"

            commits = fetch_commits(username, repo.get('name'), token)
            if commits:
                output += "  Latest commits:\n"
                for c in commits[:5]:
                    sha = c.get('sha')
                    message = c.get('commit', {}).get('message', '').split('\n')[0]
                    date = c.get('commit', {}).get('author', {}).get('date')
                    output += f"    {sha[:7]}: {message} ({date})\n"
            else:
                output += "  No commits found.\n"
    else:
        output += "No public repositories found.\n"

    output += "\n--- Public Gists ---\n"
    gists = fetch_gists(username, token) or []
    if gists:
        for gist in gists:
            output += f"- {gist.get('html_url')}: {gist.get('description') or 'No description'}\n"
    else:
        output += "No public gists found.\n"

    output += "\n--- Recent Public Events ---\n"
    events = fetch_events(username, token) or []
    if events:
        for event in events[:10]:
            repo_name = event.get('repo', {}).get('name', 'N/A')
            output += f"- {event.get('type')} at {event.get('created_at')} in repo {repo_name}\n"
    else:
        output += "No recent public events found.\n"

    return output
