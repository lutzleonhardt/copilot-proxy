import os
from litellm import completion

# Configure environment to point LiteLLM to the local mock server.
# "OPENAI_API_BASE" is recognized by LiteLLM to override the default OpenAI endpoint.
os.environ["OPENAI_API_KEY"] = "test"  # Placeholder
os.environ["OPENAI_API_BASE"] = "http://localhost:3000/v1"

def run_litellm_non_stream():
    """Calls local server in non-stream mode using LiteLLM."""
    try:
        response = completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello from a non-stream test"}],
            stream=False
        )
        print("Non-streaming response:", response)
    except Exception as e:
        print("Error in non-stream mode:", e)

def run_litellm_stream():
    """Calls local server in stream mode using LiteLLM."""
    try:
        response = completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello from a streaming test"}],
            stream=True
        )
        print("Streaming response:", response)
    except Exception as e:
        print("Error in streaming mode:", e)

if __name__ == "__main__":
    print("Running LiteLLM Client Non-Stream Mode:")
    run_litellm_non_stream()
    print("\nRunning LiteLLM Client Stream Mode:")
    run_litellm_stream()
