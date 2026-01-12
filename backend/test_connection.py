"""
Test MongoDB Atlas connection with different SSL configurations.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import ssl

MONGODB_URI = "mongodb+srv://anjan:anjan123@cluster1.gbgu4f1.mongodb.net/?retryWrites=true&w=majority"

async def test_connection():
    """Test different connection methods."""
    
    print("Testing MongoDB Atlas connection...\n")
    
    # Method 1: With tlsAllowInvalidCertificates
    print("Method 1: tlsAllowInvalidCertificates")
    try:
        client = AsyncIOMotorClient(
            MONGODB_URI,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            serverSelectionTimeoutMS=5000
        )
        await client.admin.command('ping')
        print("✅ SUCCESS with tlsAllowInvalidCertificates\n")
        client.close()
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)[:100]}\n")
    
    # Method 2: Without any TLS options
    print("Method 2: Default (no TLS options)")
    try:
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("✅ SUCCESS with default settings\n")
        client.close()
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)[:100]}\n")
    
    # Method 3: Standard connection (non-SRV)
    print("Method 3: Standard connection string")
    standard_uri = "mongodb://anjan:anjan123@ac-j6szex7-shard-00-00.gbgu4f1.mongodb.net:27017,ac-j6szex7-shard-00-01.gbgu4f1.mongodb.net:27017,ac-j6szex7-shard-00-02.gbgu4f1.mongodb.net:27017/?ssl=true&replicaSet=atlas-14qyw0-shard-0&authSource=admin&retryWrites=true&w=majority"
    try:
        client = AsyncIOMotorClient(
            standard_uri,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
        )
        await client.admin.command('ping')
        print("✅ SUCCESS with standard connection\n")
        client.close()
        return True
    except Exception as e:
        print(f"❌ FAILED: {str(e)[:100]}\n")
    
    print("❌ All connection methods failed.")
    print("\nPossible solutions:")
    print("1. Check if your IP is whitelisted in MongoDB Atlas Network Access")
    print("2. Verify username/password are correct")
    print("3. Try using MongoDB Compass to test the connection")
    print("4. Consider using a local MongoDB instance")
    
    return False

if __name__ == "__main__":
    asyncio.run(test_connection())
