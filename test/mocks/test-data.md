# Mock DID:ION Service - Sample Test Data

This directory contains sample data for testing the Mock DID:ION service.

## Sample Public Keys

### Ed25519 Keys
- `3M2mTGjHSXzpzVcxUjGCDNDHn5M9ux4rGqF8RpqBsHQA` - Primary test key
- `4N3nUHkJTYapzWdxXvGCENEIn6N0vx5sHrF9TrfCsJRB` - Secondary test key

### RSA Keys
- `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7S` - Sample RSA key (truncated)

### secp256k1 Keys
- `02f9a8b3c4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3` - Sample secp256k1 key

## Sample Signatures

### Valid Ed25519 Signatures (64+ characters)
- `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Valid RSA Signatures (256+ characters)
- `abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`

### Invalid Signatures (too short)
- `short`
- `tooshort123`

## Sample Data for Signing
- `Hello, World!`
- `This is a test message for DID signature verification`
- `{"type": "VerifiableCredential", "issuer": "did:ion:example"}`
