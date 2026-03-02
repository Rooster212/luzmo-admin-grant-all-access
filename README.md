# Luzmo Admin Granter

A utility script to manage user permissions and admin access in Luzmo organizations.

## Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   LUZMO_API_KEY=<your-api-key>
   LUZMO_API_TOKEN=<your-api-token>
   TARGET_USER_ID=<user-id>
   TARGET_ORG_ID=<organization-id>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Grant Admin Access
Promote a user to admin in an organization:
```bash
node index.js --promote-user-to-admin
```
Uses the `TARGET_USER_ID` from `.env`.

**Caveat:** The user must be part of the main organization, not a sub-organization, or the operation will fail with "instance could not be associated".

### Grant Rights on Securables
Grant full read/use/modify/own rights on all securables to the target user:
```bash
node index.js
```

With dry-run mode to preview without making changes:
```bash
node index.js --dry-run
```

### List Users
Get all users in the target organization:
```bash
node index.js --get-users
```

### Get User by Email
Find and display a specific user:
```bash
node index.js --get-user-by-email user@example.com
```

### List Organization
Display organization details:
```bash
node index.js --get-org
```

## Important Notes

- The promote-to-admin operation requires the user to be in the **main organization**, not a sub-organization
- Securables pagination may not fetch all items if the API response structure is non-standard
- All API credentials must be set in the `.env` file and are not required in environment when using dotenv
