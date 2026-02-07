# Quick Start: Auto Registration Service

Get started with automatic user registration and login in 5 minutes.

## What is Auto-Registration?

Auto-Registration automatically creates user accounts, completes authentication, and logs users in without any manual intervention. Perfect for:
- Testing
- Load testing
- Demo environments
- Community seeding
- Integration testing

## Installation

The service is already included in your project:

```
backend/src/services/autoRegistrationService.js
```

## 5-Minute Quick Start

### 1. Register a Single User

```javascript
const autoReg = require('./services/autoRegistrationService');

// Create one user automatically
const user = await autoReg.autoRegister({
  displayName: 'John Doe',
  bio: 'My bio here'
});

console.log(user.username);  // user_a1b2c3d4
console.log(user.token);     // JWT token for API calls
console.log(user.email);     // user_a1b2c3d4@proof.local
console.log(user.password);  // SecurePassword123!@#
```

**Output:**
```
🤖 Auto-registering user: user_a1b2c3d4
✓ User registered: uuid
✓ Conversational auth completed
✓ User logged in automatically
✓ Profile updated
✓ Avatar generated
✅ User fully registered and logged in: user_a1b2c3d4
```

### 2. Register Multiple Users

```javascript
// Create 10 users at once
const users = await autoReg.autoRegisterMultiple(10, {
  usernamePrefix: 'community',
  displayName: 'Community Member',
  bio: 'Active member'
});

console.log(`Created ${users.length} users`);
users.forEach(user => {
  console.log(`${user.username} - Token: ${user.token}`);
});
```

### 3. Use the Token for API Calls

```javascript
const axios = require('axios');

// Get the token from auto-registered user
const user = await autoReg.autoRegister();

// Use it to make API calls
const response = await axios.get('/api/users/profile', {
  headers: { Authorization: `Bearer ${user.token}` }
});

console.log(response.data);
```

### 4. Login an Existing User

```javascript
// Login a user you registered earlier
const session = await autoReg.autoLogin(
  'user_a1b2c3d4@proof.local',
  'SecurePassword123!@#'
);

console.log(session.token); // New JWT token
```

### 5. Get User Information

```javascript
// Get all registered users
const allUsers = autoReg.getRegisteredUsers();

// Get specific user
const user = autoReg.getUserByUsername('user_a1b2c3d4');

// Get credentials for re-login
const creds = autoReg.getUserCredentials('user_a1b2c3d4');
// { email, password, token }
```

## Common Use Cases

### Use Case 1: Testing API Endpoints

```javascript
// Create a test user
const testUser = await autoReg.autoRegister({
  displayName: 'API Test User'
});

// Test an endpoint
const response = await axios.post('/api/posts/create', 
  {
    title: 'Test Post',
    content: 'Testing the API'
  },
  {
    headers: { Authorization: `Bearer ${testUser.token}` }
  }
);

console.log('API test passed:', response.status === 201);
```

### Use Case 2: Load Testing

```javascript
// Create 100 users for load testing
const loadTestUsers = await autoReg.autoRegisterMultiple(100, {
  usernamePrefix: 'loadtest'
});

// Export their credentials
const exported = autoReg.exportUsers();
fs.writeFileSync('load-test-users.json', JSON.stringify(exported));

console.log(`Created ${loadTestUsers.length} users for load testing`);
```

### Use Case 3: Demo Environment

```javascript
// Create demo users with nice names
const demoUsers = await autoReg.autoRegisterMultiple(20, {
  usernamePrefix: 'demo',
  displayName: 'Demo User',
  bio: 'Exploring Proof',
  avatarPrompt: 'A professional avatar'
});

console.log(`Demo environment ready with ${demoUsers.length} users`);
```

### Use Case 4: Community Seeding

```javascript
// Create community members
const members = await autoReg.autoRegisterMultiple(50, {
  usernamePrefix: 'member',
  displayName: 'Community Member',
  bio: 'Active community participant'
});

// Join them to a community
for (const member of members) {
  await axios.post('/api/communities/join',
    { communityId: 'your-community-id' },
    { headers: { Authorization: `Bearer ${member.token}` } }
  );
}

console.log(`Added ${members.length} members to community`);
```

## What Gets Created Automatically?

When you auto-register a user, the system automatically:

✅ Generates a random username (e.g., `user_a1b2c3d4`)
✅ Generates a random email (e.g., `user_a1b2c3d4@proof.local`)
✅ Generates a secure password (16 characters with mixed case, numbers, symbols)
✅ Creates the user account
✅ Completes conversational authentication
✅ Logs the user in
✅ Generates a JWT token
✅ Sets up the profile
✅ Generates an avatar

All in one function call!

## Configuration

### Default Settings

```javascript
{
  usernamePrefix: 'user',           // Prefix for username
  displayName: null,                // Display name (defaults to username)
  bio: 'Proof community member',    // User bio
  avatarPrompt: 'A friendly avatar' // Avatar generation prompt
}
```

### Environment Variables

```bash
# .env
API_URL=http://localhost:3001/api
```

## Generated Credentials Format

### Username
```
{prefix}_{8-char-uuid}
Example: user_a1b2c3d4
```

### Email
```
{username}@proof.local
Example: user_a1b2c3d4@proof.local
```

### Password
```
16-character random string
Example: aB3!xY9@mK2$pL5#
```

## API Endpoints

### Auto-Register Single User
```bash
curl -X POST http://localhost:3001/api/auth/auto-register \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Doe",
    "bio": "My bio"
  }'
```

### Auto-Register Multiple Users
```bash
curl -X POST http://localhost:3001/api/auth/auto-register-batch \
  -H "Content-Type: application/json" \
  -d '{
    "count": 10,
    "usernamePrefix": "user",
    "displayName": "Test User"
  }'
```

### Get Registered Users
```bash
curl http://localhost:3001/api/auth/registered-users
```

### Export Users
```bash
curl http://localhost:3001/api/auth/export-users > users.json
```

## Troubleshooting

### Problem: "Username already exists"
**Solution:** The username is randomly generated, but if you get this error, try again or clear users:
```javascript
autoReg.clearUsers();
```

### Problem: "API_URL not set"
**Solution:** Set the environment variable:
```bash
export API_URL=http://localhost:3001/api
```

### Problem: "Conversational auth failed"
**Solution:** Make sure the conversation endpoint is working:
```bash
curl http://localhost:3001/api/conversations/message
```

### Problem: "Login failed"
**Solution:** Check that the registration completed successfully by looking at the logs

## Next Steps

1. **Read Full Documentation:** See [AUTO_REGISTRATION.md](./AUTO_REGISTRATION.md)
2. **Integrate with Bot Service:** See [BOT_SERVICE.md](./BOT_SERVICE.md)
3. **Run Tests:** Use auto-registered users for testing
4. **Load Test:** Create 100+ users for load testing
5. **Demo:** Set up a demo environment with pre-populated users

## Examples

### Example 1: Create and Use a User

```javascript
const autoReg = require('./services/autoRegistrationService');
const axios = require('axios');

// Create user
const user = await autoReg.autoRegister({
  displayName: 'Alice'
});

// Use token for API call
const profile = await axios.get('/api/users/profile', {
  headers: { Authorization: `Bearer ${user.token}` }
});

console.log(`User ${user.username} profile:`, profile.data);
```

### Example 2: Batch Create and Export

```javascript
const autoReg = require('./services/autoRegistrationService');
const fs = require('fs');

// Create 50 users
const users = await autoReg.autoRegisterMultiple(50);

// Export to file
const exported = autoReg.exportUsers();
fs.writeFileSync('users.json', JSON.stringify(exported, null, 2));

console.log(`Created and exported ${exported.count} users`);
```

### Example 3: Create Users for Different Purposes

```javascript
const autoReg = require('./services/autoRegistrationService');

// Test users
const testUsers = await autoReg.autoRegisterMultiple(5, {
  usernamePrefix: 'test',
  displayName: 'Test User'
});

// Demo users
const demoUsers = await autoReg.autoRegisterMultiple(20, {
  usernamePrefix: 'demo',
  displayName: 'Demo User',
  bio: 'Exploring Proof'
});

// Load test users
const loadTestUsers = await autoReg.autoRegisterMultiple(100, {
  usernamePrefix: 'loadtest'
});

console.log(`Created ${testUsers.length} test users`);
console.log(`Created ${demoUsers.length} demo users`);
console.log(`Created ${loadTestUsers.length} load test users`);
```

## Key Features

✨ **Fully Automatic** - No manual steps needed
✨ **Instant Login** - Users are logged in immediately
✨ **Secure Passwords** - 16-character random passwords
✨ **Profile Setup** - Display name, bio, avatar all set
✨ **Batch Operations** - Create 100+ users at once
✨ **Easy Tracking** - Get user info anytime
✨ **Export Ready** - Export credentials for load testing tools

## Performance

- Single user registration: ~2-3 seconds
- Batch registration (10 users): ~20-30 seconds
- Batch registration (100 users): ~3-5 minutes

## Security Notes

- Auto-registered users use `@proof.local` email domain
- Passwords are randomly generated and secure
- Tokens are standard JWT tokens
- All operations are logged
- Subject to rate limiting

---

**Ready to get started?** Create your first user:

```javascript
const autoReg = require('./services/autoRegistrationService');
const user = await autoReg.autoRegister();
console.log(`Welcome ${user.username}!`);
```
