from google import genai
from fetch_github_info import get_github_user_data
from fetch_linkedin_info import get_linkedin_profile_data
from fetch_resume_info import get_resume_data


with open("cache.txt") as f:
    context = f.read().strip()

with open("gemini_api.txt") as f:
    API_KEY = f.read().strip()

client = genai.Client(api_key=API_KEY)
chat = client.chats.create(model="gemini-2.0-flash")

response = chat.send_message("You are a helpful assistant and your main job is to write emails for me. "
                             "ILl give you the context and you will write an email for me. lets assume for now, we are writing an email to sundar pichai. just gimem a good email")
print(response.text)

response = chat.send_message(context)
print(response.text)

for message in chat.get_history():
    print(f'role - {message.role}',end=": ")
    print(message.parts[0].text)
