import asyncio
from services.rustfs_service import rustfs_service
from config import get_settings

settings = get_settings()

async def test_connection():
    print(f"Testing connection to: {settings.rustfs_endpoint_url}")
    print(f"Bucket: {settings.rustfs_bucket_name}")
    print(f"Access Key: {settings.rustfs_access_key}")
    print("=" * 40)
    
    if not rustfs_service.s3_client:
        print("FAIL: s3_client is None. Credentials or endpoint might be missing from .env.")
        return

    try:
        # Try to list buckets to verify auth and endpoint
        response = rustfs_service.s3_client.list_buckets()
        print(f"SUCCESS! Connected to RustFS.")
        print(f"Available buckets: {[b['Name'] for b in response.get('Buckets', [])]}")
        
    except Exception as e:
        print(f"FAIL: Could not connect to RustFS or authenticate.")
        print(f"Error details: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
