# Deployment Specification: GitHub Push & Directus Migration

**Version**: 1.0.0
**Status**: Draft
**Created**: 2025-10-24

## Overview

Push local frontend and backend code to existing GitHub repositories and safely migrate Directus schema and data changes from local development environment to production Render deployment without losing any production data.

## Current State

### ✅ Already Configured
- **Render Infrastructure**: Production environment already deployed and running
- **GitHub Repositories**:
  - Frontend: `https://github.com/pixelsock/fuma.git` (connected)
  - Backend: `https://github.com/pixelsock/udo-backend.git` (connected)
- **Git Setup**: Both repos initialized with remotes configured
- **Render Auto-Deploy**: Presumably configured to deploy from GitHub

### 🔧 Needs Completion
- **Git Commits**: Uncommitted changes in both repos need to be committed
- **Git Push**: Both repos need to be pushed to GitHub to trigger deployment
- **Directus Schema Migration**: Local schema changes need to be applied to production
- **Directus Data Migration**: Local data changes need to be merged with production data

## Architecture

```
Local Development                    GitHub                      Render Production
─────────────────                    ──────                      ─────────────────

Frontend (master)  ──► git push ──►  pixelsock/fuma      ──►  Auto-deploy
  └─ Uncommitted                       (master branch)          Frontend Service

Backend (main)     ──► git push ──►  pixelsock/udo-backend ──► Auto-deploy
  └─ Uncommitted                       (main branch)            Backend Service
  └─ Schema changes                                             (Directus)
  └─ Data changes                                               └─ PostgreSQL DB
                                                                     ↑
                         Directus Migration ──────────────────────┘
                         (Schema + Data)
```

## Implementation Plan

### Phase 1: Pre-Deployment Validation

#### 1.1 Review Pending Changes

**Frontend**:
```bash
cd /Users/nick/Sites/charlotteUDO/frontend
git status
git diff
```

**Backend**:
```bash
cd /Users/nick/Sites/charlotteUDO/backend
git status
git diff
```

**Validation**:
- ✅ Review all uncommitted changes
- ✅ Verify no sensitive data (secrets, API keys) in changes
- ✅ Confirm no .env files being committed
- ✅ Verify .gitignore properly configured

#### 1.2 Directus Schema Export

**Export Local Schema**:
```bash
cd /Users/nick/Sites/charlotteUDO/backend
npx directus schema snapshot --format json ./migration/schema-local.json
```

**Document Changes**:
- List all new collections added
- List all new fields in existing collections
- List any modified relationships
- Note any field type changes

**Validation**:
- ✅ Schema file exported successfully
- ✅ Schema contains all expected collections
- ✅ All changes documented

#### 1.3 Directus Data Export

**Export Local Data**:
```bash
cd /Users/nick/Sites/charlotteUDO/backend

# Create migration directory
mkdir -p migration/data

# For each collection with new data:
npx directus data export --collection <collection_name> --output migration/data/<collection_name>.json
```

**Document Data Changes**:
- List collections with new items
- Count items per collection
- Identify potential ID conflicts
- Note any file uploads that need migration

**Validation**:
- ✅ All data exported successfully
- ✅ Item counts verified
- ✅ No sensitive data in exports

#### 1.4 Production Database Backup

**⚠️ CRITICAL**: Backup before any changes

**Via Render Dashboard**:
1. Navigate to PostgreSQL database service
2. Create manual backup snapshot
3. Verify backup completed successfully

**Or via CLI**:
```bash
# Get connection string from Render dashboard
pg_dump <production-database-url> > backups/production-backup-$(date +%Y%m%d-%H%M%S).sql
```

**Validation**:
- ✅ Backup created successfully
- ✅ Backup file size reasonable (not 0 bytes)
- ✅ Backup stored securely

### Phase 2: Parallel GitHub Push

**Execution Strategy**: Two sub-agents execute frontend and backend pushes in parallel

#### 2.1 Frontend Sub-Agent: Commit & Push

**Steps**:
1. Navigate to frontend directory
2. Review changes: `git status` and `git diff`
3. Stage all changes: `git add .`
4. Commit with descriptive message: `git commit -m "Deploy: <description of changes>"`
5. Push to GitHub: `git push origin master`
6. Verify push succeeded
7. Monitor Render deployment (if auto-deploy enabled)

**Expected Outcome**:
- ✅ Changes committed successfully
- ✅ Pushed to GitHub (pixelsock/fuma)
- ✅ Render deployment triggered (if configured)

**Branch Note**: Frontend is on `master` branch, not `main`

#### 2.2 Backend Sub-Agent: Commit & Push

**Steps**:
1. Navigate to backend directory
2. Review changes: `git status` and `git diff`
3. Exclude migration files from commit (if desired):
   ```bash
   # Add to .gitignore if not already there
   echo "migration/" >> .gitignore
   ```
4. Stage changes: `git add .`
5. Commit with descriptive message: `git commit -m "Deploy: <description of changes>"`
6. Push to GitHub: `git push origin main`
7. Verify push succeeded
8. Monitor Render deployment

**Expected Outcome**:
- ✅ Changes committed successfully
- ✅ Pushed to GitHub (pixelsock/udo-backend)
- ✅ Render deployment triggered
- ✅ Migration files excluded from commit (optional)

**Branch Note**: Backend is on `main` branch

#### 2.3 Coordination & Progress Tracking

**Parallel Execution**:
```
┌─────────────────────┐         ┌─────────────────────┐
│   Frontend Agent    │         │   Backend Agent     │
└─────────────────────┘         └─────────────────────┘
         │                               │
         ├─► Review Changes              ├─► Review Changes
         │                               │
         ├─► Commit Changes              ├─► Commit Changes
         │                               │
         ├─► Push to GitHub              ├─► Push to GitHub
         │   (master branch)             │   (main branch)
         │                               │
         ├─► Verify Push                 ├─► Verify Push
         │                               │
         ├─► Monitor Deploy              ├─► Monitor Deploy
         │                               │
         ▼                               ▼
    ✅ Frontend Live              ✅ Backend Live
                                         │
                                         ▼
                                  ⏳ Ready for Migration
```

**Progress Tracking**:
- Real-time status from each agent
- Consolidated progress dashboard
- Alert on any push failures

**Safety**: Both agents can work independently without blocking each other

### Phase 3: Directus Schema Migration

**⚠️ CRITICAL**: Execute AFTER backend is deployed and stable

#### 3.1 Verify Backend Deployment

**Health Check**:
```bash
# Get backend URL from Render dashboard
curl https://<backend-url>.onrender.com/server/health
```

**Expected**: 200 OK response

**Admin Access**:
- Navigate to Directus admin UI
- Login with production credentials
- Verify service is running

**Validation**:
- ✅ Backend accessible
- ✅ Health check passes
- ✅ Admin login works
- ✅ No deployment errors in Render logs

#### 3.2 Export Production Schema

**Steps**:
1. Access production backend (via Render Shell or SSH)
2. Export current production schema:
   ```bash
   npx directus schema snapshot --format json ./schema-production.json
   ```
3. Download schema file for comparison

**Validation**:
- ✅ Production schema exported
- ✅ File downloaded successfully

#### 3.3 Schema Comparison & Planning

**Compare Schemas**:
```bash
# On local machine
cd /Users/nick/Sites/charlotteUDO/backend/migration

# Compare files (use diff, or visual diff tool)
diff schema-production.json schema-local.json > schema-diff.txt

# Or use a JSON diff tool
```

**Identify Changes**:
- **New Collections**: List all collections in local but not in production
- **New Fields**: List all fields added to existing collections
- **Modified Fields**: Field type changes, constraint changes
- **New Relationships**: M2O, O2M, M2M, M2A relationships

**Plan Application Order**:
1. Create new collections first
2. Add new fields to existing collections
3. Create relationships last

**Validation**:
- ✅ All changes identified and documented
- ✅ No destructive changes (dropping collections/fields)
- ✅ Application order planned

#### 3.4 Apply Schema Changes

**Method 1: Directus CLI (Recommended)**

**Via Render Shell**:
```bash
# Upload schema-local.json to production backend
# Via Render Shell or file upload

# Apply schema
npx directus schema apply --yes ./schema-local.json
```

**Method 2: Manual Application (If CLI not available)**

1. Navigate to Directus admin UI on production
2. For each new collection:
   - Create collection with correct settings
   - Add primary key field
   - Add all fields with correct types
3. For each new field in existing collection:
   - Navigate to collection settings
   - Add field with correct type and constraints
4. For each relationship:
   - Create relationship with correct configuration

**Validation After Each Step**:
- ✅ Collection/field created successfully
- ✅ No errors in Directus logs
- ✅ Collection/field visible in admin UI

#### 3.5 Verify Schema Migration

**Verification Steps**:
1. Export production schema again
2. Compare with local schema
3. Check all collections present
4. Check all fields present
5. Verify relationships configured

**Test Operations**:
- Create test item in new collection
- Update test item
- Delete test item
- Test relationships

**Validation**:
- ✅ Production schema matches local schema
- ✅ All collections and fields present
- ✅ CRUD operations work
- ✅ No schema-related errors

### Phase 4: Directus Data Migration

**⚠️ CRITICAL**: Execute AFTER schema migration is complete and verified

#### 4.1 Prepare Data Import

**Review Export Files**:
```bash
cd /Users/nick/Sites/charlotteUDO/backend/migration/data
ls -lh *.json

# For each file, check item count
jq '. | length' <collection_name>.json
```

**Identify Potential Conflicts**:
- UUID conflicts (if using UUIDs)
- Unique constraint violations
- Missing foreign key references
- Duplicate entries

**Plan Import Order**:
1. Import independent collections first (no foreign keys)
2. Import collections with foreign keys next
3. Verify after each import

**Validation**:
- ✅ All data files reviewed
- ✅ Item counts verified
- ✅ Import order planned
- ✅ Conflicts identified

#### 4.2 Data Import Strategy

**Strategy**: Safe, incremental import with duplicate detection

**Import Script** (recommended approach):
```javascript
// import-data.js
const axios = require('axios');
const fs = require('fs');

const DIRECTUS_URL = process.env.DIRECTUS_URL; // Production URL
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;   // Admin token

async function importCollection(collectionName, dataFile) {
  console.log(`\nImporting ${collectionName}...`);
  const data = JSON.parse(fs.readFileSync(dataFile));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of data) {
    try {
      // Check if item exists (by ID or unique field)
      const existing = await axios.get(
        `${DIRECTUS_URL}/items/${collectionName}/${item.id}`,
        {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
          validateStatus: () => true // Don't throw on 404
        }
      );

      if (existing.status === 404) {
        // Item doesn't exist, create it
        await axios.post(
          `${DIRECTUS_URL}/items/${collectionName}`,
          item,
          { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
        );
        created++;
        console.log(`  ✅ Created ${collectionName}: ${item.id}`);
      } else {
        skipped++;
        console.log(`  ⏭️  Skipped existing ${collectionName}: ${item.id}`);
      }
    } catch (error) {
      errors++;
      console.error(`  ❌ Error importing ${collectionName} ${item.id}:`, error.message);
    }
  }

  console.log(`\n${collectionName} Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

// Main execution
(async () => {
  try {
    // Import collections in dependency order
    await importCollection('collection_1', './data/collection_1.json');
    await importCollection('collection_2', './data/collection_2.json');
    // ... add more as needed

    console.log('\n✅ Data import complete!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
})();
```

**Run Import**:
```bash
# On local machine with production credentials
cd /Users/nick/Sites/charlotteUDO/backend/migration

DIRECTUS_URL=https://<backend-url>.onrender.com \
ADMIN_TOKEN=<admin-token-from-render> \
node import-data.js
```

#### 4.3 Alternative: Directus CLI Import

**Steps**:
```bash
# Via Render Shell on production backend
cd /path/to/uploaded/data

# Import each collection
npx directus data import --collection <collection_name> --file <collection_name>.json
```

**Note**: This method may overwrite existing items, so less safe than API method

#### 4.4 Verify Data Migration

**Verification Steps**:
1. Check item counts per collection:
   ```bash
   # Via Directus API
   curl https://<backend-url>.onrender.com/items/<collection_name>?aggregate[count]=*
   ```

2. Spot check sample items in admin UI
3. Verify relationships working
4. Check for orphaned records

**Test Functionality**:
- Browse collections in admin UI
- Test filtering and sorting
- Verify related items load correctly
- Test file uploads (if applicable)

**Validation**:
- ✅ Item counts increased by expected amount
- ✅ Sample items verified
- ✅ No orphaned records
- ✅ Relationships intact
- ✅ No data corruption

### Phase 5: Post-Migration Validation

#### 5.1 End-to-End Testing

**Frontend Testing**:
1. Navigate to production frontend URL
2. Test all pages that use affected collections
3. Verify data displays correctly
4. Test CRUD operations via frontend
5. Check browser console for errors

**Backend Testing**:
1. Test API endpoints for migrated collections
2. Verify filtering and sorting
3. Test relationships
4. Check authentication/permissions

**Validation**:
- ✅ Frontend loads successfully
- ✅ Data displays correctly
- ✅ No console errors
- ✅ API responses correct
- ✅ Relationships working

#### 5.2 Performance Check

**Metrics to Check**:
- Database query performance
- API response times
- Frontend load times
- Memory usage (Render metrics)

**Actions**:
- Review Render performance metrics
- Check for slow queries in logs
- Verify no memory leaks

**Validation**:
- ✅ Performance acceptable
- ✅ No significant degradation
- ✅ No resource alerts

#### 5.3 Data Integrity Audit

**Audit Steps**:
1. Re-export production schema and compare with local
2. Check all collections have expected item counts
3. Verify no orphaned relationships
4. Check for data anomalies

**SQL Queries** (if needed):
```sql
-- Check for orphaned relationships
SELECT * FROM collection_a
WHERE related_id NOT IN (SELECT id FROM collection_b);

-- Verify counts
SELECT COUNT(*) FROM collection_name;
```

**Validation**:
- ✅ Schema matches local
- ✅ Item counts correct
- ✅ No orphaned records
- ✅ Data integrity maintained

## Rollback Procedures

### Rollback Scenario 1: Failed Git Push

**If frontend or backend push fails**:

1. Review error message
2. Fix issue (authentication, conflicts, etc.)
3. Retry push
4. Verify success

**No production impact** - changes haven't reached production yet

### Rollback Scenario 2: Failed Schema Migration

**If schema apply fails or causes errors**:

1. **Immediate Action**:
   - Note the error
   - Do not proceed with data migration

2. **Restore from Backup**:
   ```bash
   # Connect to database
   psql <production-database-url>

   # Drop and recreate database
   DROP DATABASE <database_name>;
   CREATE DATABASE <database_name>;

   # Restore from backup
   psql <production-database-url> < backups/production-backup-YYYYMMDD-HHMMSS.sql
   ```

3. **Verify Restoration**:
   - Check Directus admin UI
   - Verify data present
   - Test API endpoints

4. **Investigate & Fix**:
   - Review schema changes
   - Fix conflicts in local schema
   - Test schema apply on local/staging first
   - Retry when fixed

**Validation**:
- ✅ Database restored from backup
- ✅ All original data present
- ✅ Services functioning normally

### Rollback Scenario 3: Data Corruption

**If data migration causes corruption or data loss**:

1. **Immediate Action**:
   - Stop any ongoing imports
   - Prevent further changes

2. **Assess Damage**:
   - Determine which collections affected
   - Check if issue is limited or widespread

3. **Restore from Backup** (if necessary):
   ```bash
   # Full restore (see Scenario 2)
   # Or selective restore using SQL
   ```

4. **Re-import Carefully**:
   - Fix import script
   - Test on subset of data first
   - Use transactional imports if possible

**Validation**:
- ✅ All original data intact
- ✅ No data corruption
- ✅ Services functioning normally

### Rollback Scenario 4: Deployment Regression

**If deployed code causes issues**:

**Via Render Dashboard**:
1. Navigate to service (frontend or backend)
2. Click "Manual Deploy" > "Rollback"
3. Select previous deployment
4. Confirm rollback

**Via Git**:
1. Revert commit locally:
   ```bash
   git revert HEAD
   git push origin <branch>
   ```
2. Render auto-deploys reverted version

**Validation**:
- ✅ Previous version deployed
- ✅ Services functioning
- ✅ No errors in logs

## Success Criteria

### Git Operations
- ✅ Frontend code pushed to GitHub (pixelsock/fuma, master branch)
- ✅ Backend code pushed to GitHub (pixelsock/udo-backend, main branch)
- ✅ No sensitive data committed
- ✅ Render auto-deploy triggered (if configured)

### Directus Schema Migration
- ✅ Production database backed up
- ✅ All local schema changes applied to production
- ✅ No production schema broken
- ✅ No data loss during schema changes
- ✅ All collections accessible

### Directus Data Migration
- ✅ All local data changes merged into production
- ✅ No production data lost or corrupted
- ✅ No duplicate entries created
- ✅ Data integrity verified
- ✅ Relationships working correctly

### Production Validation
- ✅ Frontend accessible and functioning
- ✅ Backend accessible and functioning
- ✅ Admin UI accessible
- ✅ API endpoints responding correctly
- ✅ End-to-end user flows working
- ✅ Performance acceptable

## Timeline Estimate

| Phase | Task | Estimated Duration |
|-------|------|-------------------|
| **Phase 1** | Pre-Deployment Validation | 15-30 min |
| | - Review changes | 5 min |
| | - Export schema | 5 min |
| | - Export data | 5-10 min |
| | - Backup production | 5-10 min |
| **Phase 2** | Parallel GitHub Push | 10-15 min |
| | - Frontend commit & push | 5 min |
| | - Backend commit & push | 5 min |
| | - Verify deployments | 5 min |
| **Phase 3** | Schema Migration | 20-40 min |
| | - Verify deployment | 5 min |
| | - Export production schema | 5 min |
| | - Compare & plan | 5-10 min |
| | - Apply schema | 5-10 min |
| | - Verify migration | 5-10 min |
| **Phase 4** | Data Migration | 30-60 min |
| | - Prepare import | 10 min |
| | - Run import script | 15-30 min |
| | - Verify data | 10-20 min |
| **Phase 5** | Post-Migration Validation | 15-30 min |
| | - End-to-end testing | 10-15 min |
| | - Performance check | 5 min |
| | - Data integrity audit | 5-10 min |
| **Total** | | **1.5-3 hours** |

**Notes**:
- Times assume no major issues
- Data migration time varies with volume
- Parallel push saves time vs sequential

## Environment Information

### Repositories
- **Frontend**:
  - URL: `https://github.com/pixelsock/fuma.git`
  - Branch: `master`
  - Path: `/Users/nick/Sites/charlotteUDO/frontend`

- **Backend**:
  - URL: `https://github.com/pixelsock/udo-backend.git`
  - Branch: `main`
  - Path: `/Users/nick/Sites/charlotteUDO/backend`

### Render Services
- Frontend Service: (URL from Render dashboard)
- Backend Service: (URL from Render dashboard)
- PostgreSQL Database: (Connection string from Render dashboard)

## Next Steps

After spec approval:

1. ✅ **Create Tasks List**: Run `/create-tasks` to generate actionable tasks
2. ✅ **Execute Parallel Push**: Run `/execute-tasks` to begin deployment
3. ✅ **Monitor Progress**: Track both sub-agents in parallel
4. ✅ **Execute Schema Migration**: After deployment verified
5. ✅ **Execute Data Migration**: After schema migration verified
6. ✅ **Validate Results**: Complete all validation checks
7. ✅ **Document**: Record any issues and final state

## Appendix: Useful Commands

### Git Commands
```bash
# Check status
git status
git diff

# Commit changes
git add .
git commit -m "Deploy: description"

# Push to GitHub
git push origin master  # Frontend
git push origin main    # Backend

# Verify remote
git remote -v
```

### Directus Commands
```bash
# Schema operations
npx directus schema snapshot --format json schema.json
npx directus schema apply --yes schema.json

# Data operations
npx directus data export --collection <name> --output data.json
npx directus data import --collection <name> --file data.json

# Database backup
pg_dump <connection-url> > backup.sql

# Health check
curl https://<backend-url>.onrender.com/server/health
```

### Verification Commands
```bash
# Check item count via API
curl https://<backend-url>.onrender.com/items/<collection>?aggregate[count]=*

# Test API endpoint
curl https://<backend-url>.onrender.com/items/<collection>

# JSON item count
jq '. | length' data-file.json
```
