from openai import OpenAI
import os
import random
from dotenv import load_dotenv

# 🔑 Load API key
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("API key missing! Add it in .env as GROQ_API_KEY=your_key")

# Groq client
client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

print("🤣 Groq Sarcastic Hinglish Chatbot Ready! (type 'exit' to quit)\n")

emoji = ["😂", "🤣", "😅", "🤡", "😏", "🙃", "🥴", "💀", "☠️",
               "😎", "🤪", "😤", "🫠", "🤭", "🙄", "😑", "😜", "😝",
               "🔥", "😈", "👀", "💅", "🗿", "🤌", "🐒", "🐍", "🪦",
               "🍕", "🍔", "🍟", "🎮", "🎧", "📱", "💻", "🛏️", "🚽"]

MODEL = "llama-3.1-8b-instant"   

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit","bye"]:
        print("Bot: Achha chal nikal, mujhe bhi chain se rehne do , dimag kar deta h😏")
        break

    prompt = f"""
    Tum ek savage Hinglish chatbot ho.
    - Sirf Hinglish use karo, English bilkul nahi.
    - Reply max 1-2 lines ka hi ho and normal conversation karo jo meaningfull ho.
    - Hamesha chhota, sarcastic, witty and bollywood-style jawab do.
    - Har reply me user  roast ho jisse user haste-haste fresh feel kare.
    - reply ese do jisse user has has ke pagal ho jaye.
    - haan dost jaise galiya bhi de sakte ho.
    - Formal baatein kabhi mat karo.



    User: {user_input}
    Bot:
    """

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}]
            # ⚠️ Yahan `max_output_tokens` Nahi dena
        )

        bot_reply = response.choices[0].message.content.strip()
        bot_reply += " " + random.choice(emoji)
        print("Bot:", bot_reply)

    except Exception as e:
        print("Bot: Oops, API error 😅", str(e))
