# Auto Registration Service Documentation

Automated user registration and login system for the Proof platform. Allows automatic account creation, authentication completion, and login without manual intervention.

## Features

### 1. Automatic User Registration
- Generate random usernames and emails
- Create secure passwords automatically
- Register users without manual input
- Batch registration (multiple users at once)

### 2. Automatic Authentication
- Complete conversational authentication automatically
- Pre-defined authentic responses
- Session management
- Bot score calculation

### 3. Automatic Login
- Login users immediately after registration
- JWT token generation
- Session creation
- Automatic profile setup

### 4. Profile Automation
- Auto-generate display names
- Set bio automatically
- Generate avatars with AI prompts
- Complete profile setup

### 5. User Management
- Track registered users
- Export user credentials
- Retrieve user information
- Batch operations

## Installation

The service is already included in the project. No additional installation needed.

```bash
# Service location
backend/src/services/autoRegistrationService.js
```

## API Usage

### JavaScript/Node.js

#### Single User Auto-Registration

```javascript
const autoRegService = require('./services/autoRegistrationService');

// Auto-register a single user
const user = await autoRegService.autoRegister({
  usernamePrefix: 'user',
  displayName: 'John Doe',
  bio: 'Proof community member',
  avatarPrompt: 'A friendly avatar'
});

console.log(user);
// Output:
// {
//   userId: 'uuid',
//   username: 'user_a1b2c3d4',
//   email: 'user_a1b2c3d4@proof.local',
//   password: 'SecurePassword123!@#',
//   token: 'jwt_token_here',
//   displayName: 'John Doe',
//   bio: 'Proof community member',
//   registeredAt: Date,
//   loggedIn: true
// }
```

#### Batch User Auto-Registration

```javascript
// Auto-register 10 users at once
const users = await autoRegService.autoRegisterMultiple(10, {
  usernamePrefix: 'community',
  displayName: 'Community Member',
  bio: 'Active Proof community member',
  avatarPrompt: 'A vibrant community avatar'
});

console.log(`Registered ${users.length} users`);
```

#### Auto-Login Existing User

```javascript
// Login a user automatically
const session = await autoRegService.autoLogin(
  'user_a1b2c3d4@proof.local',
  'SecurePassword123!@#'
);

console.log(session.token); // JWT token for API calls
```

#### Get Registered Users

```javascript
// Get all registered users
const allUsers = autoRegService.getRegisteredUsers();

// Get user by username
const user = autoRegService.getUserByUsername('user_a1b2c3d4');

// Get user by email
const user = autoRegService.getUserByEmail('user_a1b2c3d4@proof.local');

// Get user credentials for re-login
const creds = autoRegService.getUserCredentials('user_a1b2c3d4');
// { email, password, token }
```

#### Export Users

```javascript
// Export all registered users to JSON
const exported = autoRegService.exportUsers();
console.log(exported);
// {
//   count: 10,
//   users: [
//     { username, email, password, token, displayName, registeredAt },
//     ...
//   ]
// }
```

#### Clear Users (Testing)

```javascript
// Clear all registered users (for testing)
autoRegService.clearUsers();
```

## REST API Endpoints

### Auto-Register Single User

```
POST /api/auth/auto-register
Content-Type: application/json

{
  "usernamePrefix": "user",
  "displayName": "John Doe",
  "bio": "Proof community member",
  "avatarPrompt": "A friendly avatar"
}
```

Response:
```json
{
  "message": "User auto-registered and logged in",
  "user": {
    "userId": "uuid",
    "username": "user_a1b2c3d4",
    "email": "user_a1b2c3d4@proof.local",
    "token": "jwt_token",
    "displayName": "John Doe",
    "registeredAt": "2026-02-06T18:00:00Z",
    "loggedIn": true
  }
}
```

### Auto-Register Multiple Users

```
POST /api/auth/auto-register-batch
Content-Type: application/json

{
  "count": 10,
  "usernamePrefix": "community",
  "displayName": "Community Member",
  "bio": "Active community member",
  "avatarPrompt": "Community avatar"
}
```

Response:
```json
{
  "message": "Batch registration complete",
  "count": 10,
  "users": [
    {
      "userId": "uuid",
      "username": "community_a1b2c3d4",
      "email": "community_a1b2c3d4@proof.local",
      "token": "jwt_token",
      "displayName": "Community Member 1",
      "registeredAt": "2026-02-06T18:00:00Z"
    }
  ]
}
```

### Auto-Login User

```
POST /api/auth/auto-login
Content-Type: application/json

{
  "email": "user_a1b2c3d4@proof.local",
  "password": "SecurePassword123!@#"
}
```

Response:
```json
{
  "message": "User logged in",
  "token": "jwt_token",
  "user": {
    "userId": "uuid",
    "username": "user_a1b2c3d4",
    "email": "user_a1b2c3d4@proof.local",
    "displayName": "John Doe"
  }
}
```

### Get Registered Users

```
GET /api/auth/registered-users
```

Response:
```json
{
  "count": 10,
  "users": [
    {
      "username": "user_a1b2c3d4",
      "email": "user_a1b2c3d4@proof.local",
      "displayName": "John Doe",
      "registeredAt": "2026-02-06T18:00:00Z"
    }
  ]
}
```

### Export Users

```
GET /api/auth/export-users
```

Response:
```json
{
  "count": 10,
  "users": [
    {
      "username": "user_a1b2c3d4",
      "email": "user_a1b2c3d4@proof.local",
      "password": "SecurePassword123!@#",
      "token": "jwt_token",
      "displayName": "John Doe",
      "registeredAt": "2026-02-06T18:00:00Z"
    }
  ]
}
```

## Use Cases

### 1. Testing & Development
```javascript
// Create test users automatically
const testUsers = await autoRegService.autoRegisterMultiple(5, {
  usernamePrefix: 'test',
  displayName: 'Test User',
  bio: 'Testing the platform'
});

// Use their tokens for API testing
testUsers.forEach(user => {
  console.log(`Test user: ${user.username}, Token: ${user.token}`);
});
```

### 2. Load Testing
```javascript
// Create 100 users for load testing
const loadTestUsers = await autoRegService.autoRegisterMultiple(100, {
  usernamePrefix: 'loadtest',
  displayName: 'Load Test User',
  bio: 'Load testing'
});

console.log(`Created ${loadTestUsers.length} users for load testing`);
```

### 3. Demo & Showcase
```javascript
// Create demo users for showcasing the platform
const demoUsers = await autoRegService.autoRegisterMultiple(20, {
  usernamePrefix: 'demo',
  displayName: 'Demo User',
  bio: 'Exploring Proof platform',
  avatarPrompt: 'A professional avatar'
});
```

### 4. Community Seeding
```javascript
// Create initial community members
const communityUsers = await autoRegService.autoRegisterMultiple(50, {
  usernamePrefix: 'member',
  displayName: 'Community Member',
  bio: 'Active community participant',
  avatarPrompt: 'A community-focused avatar'
});
```

### 5. Integration Testing
```javascript
// Create users for integration tests
const integrationUsers = await autoRegService.autoRegisterMultiple(3, {
  usernamePrefix: 'integration',
  displayName: 'Integration Test User'
});

// Use tokens for API calls
const token = integrationUsers[0].token;
const response = await axios.get('/api/users/profile', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Configuration

### Environment Variables

```bash
# .env
API_URL=http://localhost:3001/api
```

### Default Settings

```javascript
// Username prefix
usernamePrefix: 'user'

// Display name (defaults to username if not provided)
displayName: null

// Bio
bio: 'Proof community member'

// Avatar prompt
avatarPrompt: 'A friendly avatar'

// Password length
passwordLength: 16
```

## Generated Credentials

### Username Format
```
{prefix}_{8-char-uuid}
Example: user_a1b2c3d4
```

### Email Format
```
{username}@proof.local
Example: user_a1b2c3d4@proof.local
```

### Password Format
```
16-character random string with:
- Uppercase letters (A-Z)
- Lowercase letters (a-z)
- Numbers (0-9)
- Special characters (!@#$%^&*)

Example: aB3!xY9@mK2$pL5#
```

## Automatic Conversational Auth

The service automatically completes conversational authentication with pre-defined responses:

1. **Question 1:** "Tell us about your experience with open-source software"
   - **Response:** "I am passionate about open-source software and have been contributing to various projects for years..."

2. **Question 2:** "What open-source projects have you contributed to?"
   - **Response:** "I have contributed to several open-source projects including Linux kernel patches..."

3. **Question 3:** "Describe your ideal avatar"
   - **Response:** "I would like my avatar to be a combination of a developer hat with a Linux penguin logo..."

These responses are designed to:
- Be authentic and genuine
- Demonstrate real open-source involvement
- Result in low bot scores
- Pass bot detection algorithms

## Security Considerations

### Password Security
- 16-character minimum length
- Mix of uppercase, lowercase, numbers, and special characters
- Randomly generated (not predictable)
- Stored securely in the database

### Token Management
- JWT tokens generated per user
- Tokens expire after configured duration
- Tokens can be refreshed
- Tokens are required for all API calls

### Email Domain
- Uses `@proof.local` domain for auto-registered users
- Easily identifiable for testing/demo purposes
- Can be changed via environment variable

### Rate Limiting
- Auto-registration is subject to rate limits
- Batch registration respects rate limits
- Prevents abuse and spam

## Logging & Monitoring

All auto-registration activities are logged:

```
🤖 Auto-registering user: user_a1b2c3d4
✓ User registered: uuid
✓ Conversational auth completed
✓ User logged in automatically
✓ Profile updated
✓ Avatar generated
✅ User fully registered and logged in: user_a1b2c3d4
```

## Error Handling

```javascript
try {
  const user = await autoRegService.autoRegister();
} catch (error) {
  console.error('Registration failed:', error.message);
  // Handle error appropriately
}
```

Common errors:
- `Registration failed: Username already exists`
- `Registration failed: Invalid email format`
- `Login failed: Invalid credentials`
- `Conversation failed: Session expired`

## Example Workflows

### Workflow 1: Quick Testing

```javascript
// Create a single test user
const testUser = await autoRegService.autoRegister({
  usernamePrefix: 'test',
  displayName: 'Test User'
});

// Use the token for API testing
const response = await axios.get('/api/users/profile', {
  headers: { Authorization: `Bearer ${testUser.token}` }
});
```

### Workflow 2: Batch Community Setup

```javascript
// Create 50 community members
const members = await autoRegService.autoRegisterMultiple(50, {
  usernamePrefix: 'member',
  displayName: 'Community Member',
  bio: 'Active community participant'
});

// Join them to communities
for (const member of members) {
  await axios.post(`/api/communities/join`, 
    { communityId: 'community-uuid' },
    { headers: { Authorization: `Bearer ${member.token}` } }
  );
}
```

### Workflow 3: Load Testing

```javascript
// Create 100 users for load testing
const loadTestUsers = await autoRegService.autoRegisterMultiple(100, {
  usernamePrefix: 'loadtest'
});

// Export credentials for load testing tools
const exported = autoRegService.exportUsers();
fs.writeFileSync('load-test-users.json', JSON.stringify(exported, null, 2));
```

### Workflow 4: Demo Showcase

```javascript
// Create demo users with nice display names
const demoUsers = await autoRegService.autoRegisterMultiple(20, {
  usernamePrefix: 'demo',
  displayName: 'Demo User',
  bio: 'Exploring Proof platform',
  avatarPrompt: 'A professional and friendly avatar'
});

console.log(`Demo environment ready with ${demoUsers.length} users`);
```

## Limitations

- Auto-registration is for testing/demo purposes only
- Users created this way are marked with `@proof.local` email domain
- Cannot create admin accounts via auto-registration
- Subject to rate limiting
- Conversational auth responses are pre-defined

## Future Enhancements

- Customizable conversational auth responses
- Scheduled auto-registration (cron jobs)
- User activity simulation
- Bulk user deletion
- User data export in multiple formats
- Integration with load testing tools (k6, JMeter)
- Automated user cleanup after tests

## Troubleshooting

### Issue: "Username already exists"
**Solution:** Use a different username prefix or clear existing users

```javascript
autoRegService.clearUsers();
```

### Issue: "Email already exists"
**Solution:** The email domain is auto-generated, ensure API_URL is correct

### Issue: "Conversational auth failed"
**Solution:** Ensure the conversation endpoint is working and session is valid

### Issue: "Login failed"
**Solution:** Verify credentials are correct and user was registered successfully

## Support

For issues or questions about auto-registration:
1. Check the logs for error messages
2. Verify API_URL environment variable
3. Ensure database connection is working
4. Check rate limiting settings
