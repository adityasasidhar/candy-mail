import requests
import json

def get_linkedin_profile_data():
    with open('proxy_curl_api.txt', 'r') as f:
        api_key = f.read().strip()

    linkedin_url = input("Enter LinkedIn profile URL: ")
    """
    Fetches and formats comprehensive LinkedIn profile data using ProxyCrawl API.

    Args:
        linkedin_profile_url (str): The URL of the LinkedIn profile to fetch.
        api_key (str): Your ProxyCrawl API key.

    Returns:
        str: A formatted string containing the LinkedIn profile data, or an error message.
    """
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    params = {
        "url": linkedin_url,
        "use_cache": "if-present",
        "skills": "include",
        "personal_contact_info": "include",
        "experiences": "include",
        "educations": "include",
        "accomplishments": "include",
        "certifications": "include",
        "projects": "include",
        "languages": "include",
        "about": "include"
    }

    response = requests.get("https://nubela.co/proxycurl/api/v2/linkedin", headers=headers, params=params)

    if response.status_code == 200:
        profile_data = response.json()

        about_text = profile_data.get("about") or "Not available"
        projects = profile_data.get("projects", [])

        output = f"""
==== LinkedIn Profile ====
Name: {profile_data.get('full_name')}
Headline: {profile_data.get('headline')}
About/Bio: {about_text}
Location: {profile_data.get('location')}
Profile URL: {profile_data.get('public_identifier')}
Profile Picture: {profile_data.get('profile_pic_url')}
Email: {profile_data.get('personal_contact_info', {}).get('email', 'N/A')}
Phone: {profile_data.get('personal_contact_info', {}).get('phone_number', 'N/A')}

== Experiences ==
"""
        for exp in profile_data.get("experiences", []):
            output += f"- {exp.get('title')} at {exp.get('company')} ({exp.get('start_date')} - {exp.get('end_date') or 'Present'})\n"

        output += "\n== Education ==\n"
        for edu in profile_data.get("educations", []):
            output += f"- {edu.get('school')} ({edu.get('degree_name')})\n"

        output += "\n== Skills ==\n"
        for skill in profile_data.get("skills", []):
            output += f"- {skill}\n"

        output += "\n== Projects ==\n"
        if projects:
            for proj in projects:
                name = proj.get('name', 'Unnamed Project')
                desc = proj.get('description', 'No description')
                output += f"- {name}: {desc}\n"
        else:
            output += "No projects listed.\n"

        output += "\n== Certifications ==\n"
        for cert in profile_data.get("certifications", []):
            output += f"- {cert.get('name')} from {cert.get('issuer')}\n"

        output += "\n== Languages ==\n"
        for lang in profile_data.get("languages", []):
            if isinstance(lang, dict):  # Proxycurl can return languages as dicts or strings
                output += f"- {lang.get('name')} ({lang.get('proficiency', 'N/A')})\n"
            else:
                output += f"- {lang}\n"

        return output

    else:
        return f"Error fetching LinkedIn profile: {response.status_code} {response.text}"
