import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from config import get_settings
import uuid
import os
import mimetypes

settings = get_settings()

class RustFSService:
    def __init__(self):
        self.endpoint_url = settings.rustfs_endpoint_url
        self.access_key = settings.rustfs_access_key
        self.secret_key = settings.rustfs_secret_key
        self.bucket_name = settings.rustfs_bucket_name

        if not self.endpoint_url or not self.access_key or not self.secret_key:
            self.s3_client = None
            print("WARNING: RustFS credentials not fully configured.")
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    endpoint_url=self.endpoint_url,
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    config=Config(signature_version='s3v4'),
                    region_name='us-east-1' # RustFS ignores this, but boto3 needs a value
                )
                self._ensure_bucket_exists()
            except Exception as e:
                print(f"Failed to initialize RustFS client: {e}")
                self.s3_client = None

    def _ensure_bucket_exists(self):
        """Ensure the target bucket exists before uploading."""
        if not self.s3_client:
            return
        
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code')
            if error_code == '404':
                try:
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                    print(f"Created RustFS bucket: {self.bucket_name}")
                except Exception as create_err:
                    print(f"Could not create bucket {self.bucket_name}: {create_err}")
            else:
                print(f"Error checking bucket {self.bucket_name}: {e}")

    async def upload_file(self, file_bytes: bytes, filename: str, user_id: str) -> str:
        """
        Upload a file bytes to RustFS (non-blocking).
        Returns the object key to store in the database.
        """
        import asyncio
        if not self.s3_client:
            raise Exception("RustFS client not initialized. Check your credentials.")

        # Generate a unique key
        extension = os.path.splitext(filename)[1].lower()
        unique_id = str(uuid.uuid4())
        object_key = f"resumes/{user_id}/{unique_id}{extension}"
        
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"

        def _do_upload():
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_bytes,
                ContentType=content_type,
            )
            return object_key

        try:
            # Run blocking boto3 call in a thread so it doesn't block the event loop
            await asyncio.to_thread(_do_upload)
            return object_key
        except ClientError as e:
            raise Exception(f"Failed to upload file to RustFS: {str(e)}")

    async def delete_file(self, object_key: str) -> bool:
        """Delete an object from RustFS. Returns True if deleted or already missing."""
        import asyncio

        if not object_key:
            return True
        if not self.s3_client:
            return False

        def _do_delete():
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_key)

        try:
            await asyncio.to_thread(_do_delete)
            return True
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            if error_code in {"404", "NoSuchKey", "NotFound"}:
                return True
            print(f"Error deleting object {object_key}: {e}")
            return False

    async def delete_files(self, object_keys: list[str]) -> list[str]:
        """Delete multiple objects and return any keys that could not be removed."""
        failed_keys: list[str] = []
        for object_key in {key for key in object_keys if key}:
            if not await self.delete_file(object_key):
                failed_keys.append(object_key)
        return failed_keys

    def get_presigned_url(self, object_key: str, expires_in: int = 3600) -> str:
        """
        Generate a presigned GET URL valid for `expires_in` seconds for secure downloading.
        """
        if not self.s3_client:
            return ""

        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return ""

# Initialize global instance
rustfs_service = RustFSService()
