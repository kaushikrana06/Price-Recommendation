import os
from openai import OpenAI

PROVIDER = os.getenv("LLM_PROVIDER", "openai")
MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

def call_llm(system: str, user: str) -> str:
    if PROVIDER != "openai":
        raise RuntimeError("This build is configured for OpenAI only.")
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role":"system","content":system},
                  {"role":"user","content":user}],
        temperature=0.2,
        response_format={"type":"json_object"},
    )
    return resp.choices[0].message.content
