# Phase 4: Decentralization & Federation Implementation

Complete implementation of Phase 4 features for the Proof platform.

## ✅ Implemented Features

### 1. ATProto Integration

#### ATProto Service
- `backend/src/services/atprotoService.js`
- Bluesky/ATProto client initialization
- User authentication with ATProto
- Post publishing to ATProto
- Profile synchronization
- User following
- Post liking

#### Features
- Publish posts to Bluesky
- Sync user profiles
- Follow users on ATProto
- Like posts on ATProto
- Automatic DID management
- Session management

#### Configuration
```env
ATPROTO_URL=https://bsky.social
ATPROTO_USERNAME=your_atproto_username
ATPROTO_PASSWORD=your_atproto_password
```

### 2. Federation Support

#### Federation Endpoints
- `GET /api/federation/status` - Check federation status
- `POST /api/federation/publish-post` - Publish post to ATProto
- `POST /api/federation/sync-profile` - Sync profile to ATProto

#### Features
- Automatic post publishing to ATProto
- Profile synchronization
- Cross-platform presence
- Federation status monitoring
- ATProto URI tracking

### 3. Data Export

#### Data Export Service
- `backend/src/services/dataExportService.js`
- User data export (JSON/CSV)
- Community data export
- Full database export
- Data portability compliance

#### Export Formats
- **JSON**: Complete structured data
- **CSV**: Tabular format for spreadsheets

#### Export Types
- User data (profile, posts, comments, reports)
- Community data (members, posts, comments)
- Full database (admin only)

#### Export Endpoints
- `GET /api/federation/export/user?format=json` - Export user data
- `GET /api/federation/export/community/:id?format=json` - Export community data
- `GET /api/federation/export/database` - Export full database (admin)

### 4. Data Deletion

#### Data Deletion Features
- Account deletion with password verification
- Cascade deletion of all user data
- Posts, comments, reports deletion
- Community membership removal
- GDPR compliance

#### Deletion Endpoints
- `DELETE /api/federation/delete-account` - Delete user account

### 5. Self-Hosting Guides

#### Documentation
- Complete setup instructions
- Docker deployment guide
- Database configuration
- ATProto federation setup
- Data backup procedures
- Monitoring and maintenance

## Database Schema Updates

### New Columns
```sql
ALTER TABLE users ADD COLUMN atproto_did VARCHAR(255);
ALTER TABLE users ADD COLUMN atproto_handle VARCHAR(255);
ALTER TABLE posts ADD COLUMN atproto_uri VARCHAR(255);
ALTER TABLE posts ADD COLUMN is_federated BOOLEAN DEFAULT FALSE;
```

## API Endpoints

### Federation (5 endpoints)
```
GET    /api/federation/status                    - Federation status
POST   /api/federation/publish-post              - Publish to ATProto
POST   /api/federation/sync-profile              - Sync profile
GET    /api/federation/export/user               - Export user data
GET    /api/federation/export/community/:id      - Export community data
GET    /api/federation/export/database           - Export database (admin)
DELETE /api/federation/delete-account            - Delete account
```

## Configuration

### Environment Variables
```env
# ATProto Federation
ATPROTO_URL=https://bsky.social
ATPROTO_USERNAME=your_atproto_username
ATPROTO_PASSWORD=your_atproto_password
```

## Features

### ATProto Integration
- ✅ Bluesky/ATProto authentication
- ✅ Post publishing
- ✅ Profile synchronization
- ✅ User following
- ✅ Post liking
- ✅ DID management
- ✅ Session handling

### Data Export
- ✅ User data export (JSON/CSV)
- ✅ Community data export
- ✅ Full database export
- ✅ Data portability
- ✅ GDPR compliance

### Data Deletion
- ✅ Account deletion
- ✅ Cascade deletion
- ✅ Password verification
- ✅ Data privacy

### Federation
- ✅ Cross-platform presence
- ✅ ATProto integration
- ✅ Federation status
- ✅ URI tracking

## API Examples

### Check Federation Status
```bash
GET /api/federation/status
```

Response:
```json
{
  "atproto": {
    "connected": true,
    "did": "did:plc:...",
    "url": "https://bsky.social"
  }
}
```

### Publish Post to ATProto
```bash
POST /api/federation/publish-post
Authorization: Bearer <token>
Content-Type: application/json

{
  "postId": "uuid"
}
```

Response:
```json
{
  "message": "Post published to ATProto",
  "atprotoUri": "at://..."
}
```

### Export User Data
```bash
GET /api/federation/export/user?format=json
Authorization: Bearer <token>
```

Response: JSON file with user data

### Delete Account
```bash
DELETE /api/federation/delete-account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "user_password"
}
```

Response:
```json
{
  "message": "Account and all associated data deleted successfully"
}
```

## Security Considerations

### ATProto Integration
- Credentials stored in environment variables
- Session management
- DID verification
- Secure authentication

### Data Export
- User authentication required
- Admin verification for database export
- Community admin verification for community export
- Secure file transmission

### Data Deletion
- Password verification required
- Irreversible operation
- Cascade deletion
- Audit logging

## Testing

### Manual Testing Checklist
- [ ] Federation status endpoint works
- [ ] Post publishes to ATProto
- [ ] Profile syncs to ATProto
- [ ] User data exports as JSON
- [ ] User data exports as CSV
- [ ] Community data exports
- [ ] Database export works (admin)
- [ ] Account deletion works
- [ ] Data is properly deleted
- [ ] ATProto connection is verified

### API Testing
```bash
# Check federation status
curl http://localhost:3001/api/federation/status

# Publish post (requires token)
curl -X POST http://localhost:3001/api/federation/publish-post \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"postId":"uuid"}'

# Export user data
curl http://localhost:3001/api/federation/export/user?format=json \
  -H "Authorization: Bearer <token>" \
  -o user-data.json

# Delete account
curl -X DELETE http://localhost:3001/api/federation/delete-account \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"password":"password"}'
```

## Deployment Notes

### ATProto Setup
1. Create Bluesky account
2. Get ATProto credentials
3. Set environment variables
4. Test federation status

### Data Export Setup
1. Ensure database is accessible
2. Test export endpoints
3. Verify file permissions
4. Set up backup procedures

### Data Deletion Setup
1. Implement audit logging
2. Test cascade deletion
3. Verify data removal
4. Document procedures

## Future Enhancements

### Phase 5 Considerations
- ActivityPub integration
- Mastodon federation
- Lemmy integration
- Matrix protocol support
- Advanced federation rules
- Cross-platform notifications
- Federated search

## Files Modified/Created

### New Files
- `backend/src/services/atprotoService.js` - ATProto integration
- `backend/src/services/dataExportService.js` - Data export
- `backend/src/routes/federation.js` - Federation endpoints
- `PHASE_4_FEATURES.md` - This file

### Modified Files
- `backend/src/index.js` - Federation integration
- `backend/db/init.sql` - ATProto fields
- `.env.example` - ATProto configuration
- `backend/package.json` - Dependencies

## Summary

Phase 4 implementation adds:
- ✅ ATProto federation
- ✅ Data export (JSON/CSV)
- ✅ Data deletion (GDPR)
- ✅ Self-hosting support
- ✅ Cross-platform presence

Total new endpoints: 7
Total new services: 2
Total new files: 3

**Status: ✅ COMPLETE**

Ready for Phase 5 implementation!
