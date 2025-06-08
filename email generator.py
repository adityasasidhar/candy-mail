from google import genai
# from fetch_github_info import get_github_user_data
# from fetch_linkedin_info import get_linkedin_profile_data
# from fetch_resume_info import get_resume_data


with open("cache.txt") as f:
    context = f.read().strip()

with open("gemini_api.txt") as f:
    API_KEY = f.read().strip()

client = genai.Client(api_key=API_KEY)
chat = client.chats.create(model="gemini-2.0-flash")

prompt = input("what do you need: ")
response = chat.send_message(f"You are a helpful assistant and your main job is to write emails for me. "
                             "ILl give you the context and you will write an email for me. just give me a good email"
                             "the context included github, linkedin and resume information. just tailor a single good email without nonsense. "
                             "Dont respond anything much now, this is just a system instruction, we will pass the prompt request and context later."
                             "i dont need any explanations or suggestions, just write the email. and whatever you write goes straight to the sender. "
                             "You have access to all the urls and phone numbers in the context. you are absolutely free to use any of them in the email, so better use them. ")

print(response.text)
response = chat.send_message(f"{prompt}. "
                             f"And heres the context: {context}. ")
print(response.text)

for message in chat.get_history():
    print(f'role - {message.role}',end=": ")
    print(message.parts[0].text)
