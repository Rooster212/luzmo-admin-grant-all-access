# Luzmo Admin Granter

A utility script to manage user permissions, admin access, and group management in Luzmo organizations.

## Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   LUZMO_API_KEY=<your-api-key>
   LUZMO_API_TOKEN=<your-api-token>
   TARGET_USER_ID=<user-id>         # Optional, required for user operations
   TARGET_ORG_ID=<organization-id>  # Optional, required for organization operations
   TARGET_GROUP_ID=<group-id>       # Optional, required for group operations
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Organization Operations

#### List Organization
Display organization details:
```bash
node index.js --get-org
```

### User Operations

#### List Users
Get all users in the target organization:
```bash
node index.js --get-users
```

#### Get User by Email
Find and display a specific user:
```bash
node index.js --get-user-by-email user@example.com
```

#### Grant Admin Access
Promote a user to admin in an organization:
```bash
node index.js --promote-user-to-admin
```
Uses the `TARGET_USER_ID` from `.env`.

**Caveat:** The user must be part of the main organization, not a sub-organization, or the operation will fail with "instance could not be associated".

#### Grant Rights on Securables to User
Grant full read/use/modify/own rights on all securables to the target user:
```bash
node index.js
```

With dry-run mode to preview without making changes:
```bash
node index.js --dry-run
```

### Group Operations

#### List Groups
Get all groups with their IDs and names:
```bash
node index.js --get-groups
```

#### Update Group Name
Update a group's name in multiple languages:
```bash
# Update with multiple languages
node index.js --update-group-name --group-id <group-id> --name-en "Admin Group" --name-fr "Groupe Admin"

# Supports English, French, Dutch, German, and Spanish
node index.js --update-group-name --group-id <group-id> \
  --name-en "Admins" \
  --name-fr "Administrateurs" \
  --name-nl "Beheerders" \
  --name-de "Administratoren" \
  --name-es "Administradores"

# Or update just one language
node index.js --update-group-name --group-id <group-id> --name-en "New Name"
```

Supported language flags: `--name-en`, `--name-fr`, `--name-nl`, `--name-de`, `--name-es`

#### Assign All Securables to Group
Grant full rights on all securables to a specific group:
```bash
# Preview what would be assigned
node index.js --assign-to-group --dry-run

# Actually assign all securables to the group
node index.js --assign-to-group
```

Uses the `TARGET_GROUP_ID` from `.env`.

## Important Notes

- The promote-to-admin operation requires the user to be in the **main organization**, not a sub-organization
- Securables pagination may not fetch all items if the API response structure is non-standard
- All API credentials must be set in the `.env` file
- Group operations require `TARGET_GROUP_ID` to be set in `.env`
- When assigning securables to a group, it's recommended to use `--dry-run` first to preview the changes
- Group name updates support multiple languages (en, fr, nl, de, es) - specify any combination as needed
