# Mock DID:ION Service

A mock service for simulating DID:ION functionality in the Solid VC Microservices Prototype.

## Overview

The Mock DID:ION Service is designed to simulate the core functionality of the ION network for Decentralized Identifiers (DIDs). This service enables:

- DID:ION creation and registration
- DID resolution
- Verification of DID-signed credentials

## Repository Structure

- `/docs` - Documentation, OpenAPI specs, and schemas
- `/scripts` - Helper scripts for installation, testing, and running
- `/src` - Service source code
- `/test/mocks` - Mock dependencies for testing

## Key Features

- Creation of DID:ION identifiers with proper formatting
- Resolution of DIDs to their DID documents
- Verification of signatures against public keys
- Simulation of ION network consensus
- Support for different key types (RSA, Ed25519, etc.)

## Getting Started

See the [SPECIFICATION.md](./SPECIFICATION.md) file for detailed requirements and API definitions.

## Development

This project must be developed according to the requirements specified in SPECIFICATION.md.

### Requirements

- All code must be complete and functional (no TODOs or placeholders)
- Support containerized deployment
- Include comprehensive testing
- Simulate the ION network's consensus mechanism

## License

This project is part of the Solid VC Microservices Prototype.
