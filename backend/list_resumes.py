import asyncio
from services.rustfs_service import rustfs_service
from config import get_settings
from datetime import datetime

settings = get_settings()

async def list_stored_resumes():
    print("RustFS Cloud Storage Explorer")
    print("=" * 50)
    print(f"Checking Bucket: {settings.rustfs_bucket_name}")
    print("-" * 50)
    
    if not rustfs_service.s3_client:
        print("Error: RustFS client not initialized.")
        return

    try:
        # List all objects in the bucket
        response = rustfs_service.s3_client.list_objects_v2(Bucket=settings.rustfs_bucket_name)
        objects = response.get('Contents', [])
        
        if not objects:
            print("The bucket is currently empty. Upload a resume on the frontend to see it here!")
            return

        print(f"Found {len(objects)} files in storage:")
        print(f"{'#':<3} {'Object Key':<60} {'Size':<10} {'Last Modified'}")
        print("-" * 100)
        
        for i, obj in enumerate(objects, 1):
            key = obj['Key']
            size = f"{obj['Size'] / 1024:.1f} KB"
            date = obj['LastModified'].strftime('%Y-%m-%d %H:%M')
            print(f"{i:<3} {key:<60} {size:<10} {date}")
            
            # Generate a temporary download link for the first 3 files
            if i <= 3:
                link = rustfs_service.get_presigned_url(key, expires_in=300)
                print(f"    Secret Download Link (valid 5m): {link}")
                print("-" * 100)
        
        if len(objects) > 3:
            print(f"... and {len(objects) - 3} more files.")

    except Exception as e:
        print(f"Error listing resumes: {e}")

if __name__ == "__main__":
    asyncio.run(list_stored_resumes())
