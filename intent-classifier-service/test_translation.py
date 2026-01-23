import httpx
import asyncio
import json

URL = "http://localhost:8002/api/process"

async def test():
    async with httpx.AsyncClient(timeout=120) as client: # Generous timeout for first load
        # Test 1: Hindi (IndicTrans2)
        print("Testing Hindi (IndicTrans2)...")
        try:
            r = await client.post(URL, json={"query": "नमस्ते, क्या आप मेरी मदद कर सकते हैं?", "language": "hi"})
            if r.status_code == 200:
                print("✅ Hindi Processed:", json.dumps(r.json(), indent=2))
            else:
                print("❌ Hindi Failed:", r.text)
        except Exception as e:
            print(f"❌ Hindi Error: {e}")

        # Test 2: Arabic (Helsinki)
        print("\nTesting Arabic (Helsinki)...")
        try:
            r = await client.post(URL, json={"query": "مرحبا, كيف حالك؟", "language": "ar"})
            if r.status_code == 200:
                print("✅ Arabic Processed:", json.dumps(r.json(), indent=2))
            else:
                print("❌ Arabic Failed:", r.text)
        except Exception as e:
            print(f"❌ Arabic Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
