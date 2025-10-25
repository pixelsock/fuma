# Task Breakdown: GitHub Push & Directus Migration to Render

## Overview
Total Task Groups: 5
Estimated Duration: 1.5-3 hours
Execution Strategy: Phased approach with parallel execution opportunities

## Critical Safety Requirements

- MUST backup production database before any schema/data changes
- MUST NOT lose any production data during migration
- MUST validate at each phase before proceeding to next
- MUST handle duplicate detection during data import
- MUST verify schema compatibility before applying changes

## Task List

### Phase 1: Pre-Deployment Validation

#### Task Group 1.1: Change Review & Security Audit
**Dependencies:** None
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential

- [x] 1.1.0 Complete change review and security audit
  - [x] 1.1.1 Review frontend uncommitted changes
    - Navigate to `/Users/nick/Sites/charlotteUDO/frontend`
    - Run `git status` to list all changes
    - Run `git diff` to review actual code changes
    - Verify no .env files or secrets in staged changes
  - [x] 1.1.2 Review backend uncommitted changes
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend`
    - Run `git status` to list all changes
    - Run `git diff` to review actual code changes
    - Verify no .env files or database credentials in staged changes
  - [x] 1.1.3 Verify .gitignore configuration
    - Check frontend .gitignore includes: `.env`, `.env.local`, `node_modules/`
    - Check backend .gitignore includes: `.env`, `migration/`, `node_modules/`, `backups/`
  - [x] 1.1.4 Document changes for commit messages
    - List frontend changes (features, bug fixes, updates)
    - List backend changes (features, bug fixes, updates)
    - Note any breaking changes or important updates

**Acceptance Criteria:**
- All changes reviewed and documented
- No sensitive data detected in changes
- .gitignore properly configured
- Ready to commit safely

**Rollback Point:** None needed - no changes made to production

---

#### Task Group 1.2: Directus Schema Export & Documentation
**Dependencies:** None
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential

- [x] 1.2.0 Complete schema export and documentation
  - [x] 1.2.1 Create migration directory structure
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend`
    - Create directory: `mkdir -p migration/data`
    - Create directory: `mkdir -p backups`
  - [x] 1.2.2 Export local Directus schema
    - Run: `npx directus schema snapshot --format json ./migration/schema-local.json`
    - Verify file created and size is reasonable (not 0 bytes)
  - [x] 1.2.3 Document schema changes
    - Review schema-local.json
    - List all new collections added in local development
    - List all new fields in existing collections
    - Document any new relationships (M2O, O2M, M2M, M2A)
    - Note any field type changes or constraint modifications
  - [x] 1.2.4 Validate schema export
    - Verify schema contains all expected collections
    - Check that all custom fields are present
    - Ensure relationships are properly defined

**Acceptance Criteria:**
- Schema exported successfully to `migration/schema-local.json`
- All schema changes documented
- Schema file validated and complete

**Rollback Point:** None needed - no changes made to production

---

#### Task Group 1.3: Directus Data Export & Analysis
**Dependencies:** Task Group 1.2 (schema must be exported first)
**Estimated Duration:** 5-15 minutes
**Execution:** Sequential

- [x] 1.3.0 Complete data export and analysis
  - [x] 1.3.1 Identify collections with new/modified data
    - Review local Directus collections
    - Identify which collections have data to migrate
    - Prioritize collections by dependency (independent collections first)
  - [x] 1.3.2 Export data from each collection
    - For each collection with data changes:
    - Run: `npx directus data export --collection <collection_name> --output migration/data/<collection_name>.json`
    - Verify each export file created successfully
  - [x] 1.3.3 Analyze exported data
    - Check item counts: `jq '. | length' migration/data/<collection_name>.json`
    - Document item counts per collection
    - Identify potential ID conflicts (check for UUID format)
    - Note any file uploads that need special handling
  - [x] 1.3.4 Plan data import order
    - List collections in dependency order (independent first)
    - Document foreign key relationships
    - Identify potential duplicate detection needs

**Acceptance Criteria:**
- All necessary data exported to `migration/data/` directory
- Item counts documented for each collection
- Import order planned based on dependencies
- Potential conflicts identified

**Rollback Point:** None needed - no changes made to production

---

#### Task Group 1.4: Production Database Backup
**Dependencies:** None (but should be executed just before Phase 3)
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential
**CRITICAL:** This is a mandatory safety checkpoint

- [ ] 1.4.0 Complete production database backup
  - [ ] 1.4.1 Access Render dashboard
    - Log in to Render dashboard
    - Navigate to PostgreSQL database service
    - Verify database is healthy and accessible
  - [ ] 1.4.2 Create manual backup snapshot
    - Click "Manual Backup" or "Create Backup"
    - Add description: "Pre-migration backup - YYYY-MM-DD"
    - Wait for backup to complete
    - Verify backup status shows "Complete"
  - [ ] 1.4.3 Verify backup integrity
    - Check backup file size is reasonable (not 0 bytes)
    - Note backup ID/name for rollback reference
    - Document backup timestamp
  - [ ] 1.4.4 (Alternative) CLI backup if needed
    - Get database connection string from Render
    - Run: `pg_dump <production-database-url> > /Users/nick/Sites/charlotteUDO/backend/backups/production-backup-$(date +%Y%m%d-%H%M%S).sql`
    - Verify backup file size is reasonable

**Acceptance Criteria:**
- Production database backup created successfully
- Backup verified and documented
- Backup timestamp recorded for rollback reference
- Ready to proceed with schema changes

**Rollback Point:** This IS the rollback point - backup must succeed before proceeding

---

### Phase 2: Parallel GitHub Push

#### Task Group 2.1: Frontend Commit & Push
**Dependencies:** Task Group 1.1 (changes reviewed)
**Estimated Duration:** 5-10 minutes
**Execution:** Parallel with Task Group 2.2
**Specialist:** Frontend Engineer

- [ ] 2.1.0 Complete frontend deployment
  - [ ] 2.1.1 Navigate and verify branch
    - Navigate to `/Users/nick/Sites/charlotteUDO/frontend`
    - Run `git branch` to confirm on `master` branch
    - Run `git remote -v` to verify remote: `https://github.com/pixelsock/fuma.git`
  - [ ] 2.1.2 Stage all changes
    - Run `git status` to see all uncommitted files
    - Run `git add .` to stage all changes
    - Run `git status` again to verify staging
  - [ ] 2.1.3 Commit with descriptive message
    - Review changes from Task 1.1.4 documentation
    - Create commit message following this format:
      ```
      Deploy: [brief description of changes]

      - [Change 1: e.g., Add new homepage hero section]
      - [Change 2: e.g., Update navigation menu styling]
      - [Change 3: e.g., Fix mobile responsiveness issues]
      ```
    - Run commit command using heredoc for formatting:
      ```bash
      git commit -m "$(cat <<'EOF'
      [Your commit message here]
      EOF
      )"
      ```
  - [ ] 2.1.4 Push to GitHub
    - Run `git push origin master`
    - Verify push succeeded (no errors)
    - Note the commit SHA for reference
  - [ ] 2.1.5 Verify GitHub repository updated
    - Visit `https://github.com/pixelsock/fuma` in browser
    - Confirm latest commit appears on master branch
    - Check commit timestamp is recent
  - [ ] 2.1.6 Monitor Render deployment
    - Navigate to Render dashboard
    - Find frontend service
    - Check for new deployment triggered
    - Monitor deployment status (in progress/completed)
    - Review deployment logs for any errors

**Acceptance Criteria:**
- All frontend changes committed successfully
- Code pushed to GitHub (pixelsock/fuma, master branch)
- No sensitive data committed
- Render auto-deploy triggered
- Deployment completed without errors

**Rollback Point:** If push fails, fix issues and retry. No production impact until Render deploys.

---

#### Task Group 2.2: Backend Commit & Push
**Dependencies:** Task Group 1.1 (changes reviewed)
**Estimated Duration:** 5-10 minutes
**Execution:** Parallel with Task Group 2.1
**Specialist:** Backend Engineer

- [ ] 2.2.0 Complete backend deployment
  - [ ] 2.2.1 Navigate and verify branch
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend`
    - Run `git branch` to confirm on `main` branch
    - Run `git remote -v` to verify remote: `https://github.com/pixelsock/udo-backend.git`
  - [ ] 2.2.2 Exclude migration files from commit
    - Run `cat .gitignore | grep migration` to check if already excluded
    - If not present, run: `echo "migration/" >> .gitignore`
    - Run: `echo "backups/" >> .gitignore` to exclude backups too
    - Verify: `cat .gitignore` shows both entries
  - [ ] 2.2.3 Stage all changes
    - Run `git status` to see all uncommitted files
    - Verify migration/ and backups/ are not listed (should be ignored)
    - Run `git add .` to stage all changes
    - Run `git status` again to verify staging
  - [ ] 2.2.4 Commit with descriptive message
    - Review changes from Task 1.1.4 documentation
    - Create commit message following this format:
      ```
      Deploy: [brief description of changes]

      - [Change 1: e.g., Add new API endpoints for users]
      - [Change 2: e.g., Update Directus schema (will migrate separately)]
      - [Change 3: e.g., Fix authentication middleware]
      ```
    - Run commit command using heredoc for formatting:
      ```bash
      git commit -m "$(cat <<'EOF'
      [Your commit message here]
      EOF
      )"
      ```
  - [ ] 2.2.5 Push to GitHub
    - Run `git push origin main`
    - Verify push succeeded (no errors)
    - Note the commit SHA for reference
  - [ ] 2.2.6 Verify GitHub repository updated
    - Visit `https://github.com/pixelsock/udo-backend` in browser
    - Confirm latest commit appears on main branch
    - Check commit timestamp is recent
  - [ ] 2.2.7 Monitor Render deployment
    - Navigate to Render dashboard
    - Find backend service
    - Check for new deployment triggered
    - Monitor deployment status (in progress/completed)
    - Review deployment logs for any errors
    - Wait for deployment to complete fully before Phase 3

**Acceptance Criteria:**
- All backend changes committed successfully
- Code pushed to GitHub (pixelsock/udo-backend, main branch)
- Migration files excluded from commit
- No sensitive data committed
- Render auto-deploy triggered
- Deployment completed without errors

**Rollback Point:** If push fails, fix issues and retry. No production impact until Render deploys.

---

#### Task Group 2.3: Deployment Verification & Coordination
**Dependencies:** Task Groups 2.1 AND 2.2 (both must complete)
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential (after parallel tasks complete)

- [ ] 2.3.0 Complete deployment verification
  - [ ] 2.3.1 Verify both services deployed
    - Check Render dashboard shows both services deployed
    - Note deployment completion times
    - Check both services show "Live" status
  - [ ] 2.3.2 Test frontend accessibility
    - Get frontend URL from Render dashboard
    - Visit frontend URL in browser
    - Verify site loads without errors
    - Check browser console for JavaScript errors
  - [ ] 2.3.3 Test backend accessibility
    - Get backend URL from Render dashboard
    - Test health endpoint: `curl https://<backend-url>.onrender.com/server/health`
    - Verify 200 OK response
    - Test API root: `curl https://<backend-url>.onrender.com/`
  - [ ] 2.3.4 Verify Directus admin access
    - Navigate to Directus admin UI: `https://<backend-url>.onrender.com/admin`
    - Log in with production credentials
    - Verify dashboard loads successfully
    - Check all existing collections are accessible
  - [ ] 2.3.5 Review deployment logs
    - Check Render logs for frontend service
    - Check Render logs for backend service
    - Verify no error messages or warnings
    - Confirm services started successfully

**Acceptance Criteria:**
- Both frontend and backend deployed successfully
- Frontend accessible and loading correctly
- Backend health check passes
- Directus admin UI accessible
- No deployment errors in logs
- Ready to proceed with schema migration

**Rollback Point:** If deployment issues found, use Render rollback feature or git revert and push.

---

### Phase 3: Directus Schema Migration

**CRITICAL:** Execute ONLY after Task Group 2.3 completes successfully and Task Group 1.4 (backup) is confirmed

#### Task Group 3.1: Production Schema Export
**Dependencies:** Task Groups 1.4, 2.3 (deployment verified and backup completed)
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential
**Specialist:** DevOps/Backend Engineer

- [ ] 3.1.0 Complete production schema export
  - [ ] 3.1.1 Access production backend
    - Navigate to Render dashboard
    - Find backend service
    - Click "Shell" to access production shell
    - Alternatively, SSH if configured
  - [ ] 3.1.2 Export production schema
    - In production shell, run: `npx directus schema snapshot --format json ./schema-production.json`
    - Wait for export to complete
    - Verify file created: `ls -lh schema-production.json`
  - [ ] 3.1.3 Download production schema to local
    - From Render shell, run: `cat schema-production.json`
    - Copy output to local file at `/Users/nick/Sites/charlotteUDO/backend/migration/schema-production.json`
    - Alternatively, use Render file download feature if available
  - [ ] 3.1.4 Validate production schema export
    - Check file size is reasonable (not 0 bytes)
    - Validate JSON format: `jq . /Users/nick/Sites/charlotteUDO/backend/migration/schema-production.json`
    - Verify contains expected collections

**Acceptance Criteria:**
- Production schema exported successfully
- Schema file downloaded to local migration directory
- JSON format validated
- Ready for comparison with local schema

**Rollback Point:** None needed - no changes made yet (read-only operation)

---

#### Task Group 3.2: Schema Comparison & Migration Planning
**Dependencies:** Task Groups 1.2, 3.1 (both schemas exported)
**Estimated Duration:** 10-15 minutes
**Execution:** Sequential
**Specialist:** Backend Engineer

- [ ] 3.2.0 Complete schema comparison and planning
  - [ ] 3.2.1 Compare schema files
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend/migration`
    - Run: `diff schema-production.json schema-local.json > schema-diff.txt`
    - Review diff output for changes
    - Alternatively, use a JSON diff tool for better visualization
  - [ ] 3.2.2 Identify all schema changes
    - **New Collections**: List collections in local but not in production
      - Document collection names
      - Note primary key fields
      - List all fields in each new collection
    - **New Fields**: List fields added to existing collections
      - Document collection name, field name, field type
      - Note any constraints (required, unique, etc.)
    - **Modified Fields**: Identify field type or constraint changes
      - Document old vs new specifications
      - Assess risk of data loss or corruption
    - **New Relationships**: List new M2O, O2M, M2M, M2A relationships
      - Document relationship types
      - Note related collections
  - [ ] 3.2.3 Assess migration risks
    - Check for destructive changes (dropping collections/fields)
    - Identify changes that might cause data loss
    - Note any breaking changes to API
    - Verify backward compatibility
  - [ ] 3.2.4 Plan schema application order
    - Order 1: Create all new collections first
    - Order 2: Add new fields to existing collections
    - Order 3: Modify existing field constraints
    - Order 4: Create new relationships last
    - Document specific execution sequence
  - [ ] 3.2.5 Create schema migration checklist
    - For each change identified, create specific task
    - Order tasks by dependency
    - Add validation step after each task

**Acceptance Criteria:**
- All schema differences identified and documented
- No destructive changes detected (or properly planned)
- Migration order planned based on dependencies
- Risks assessed and mitigation planned
- Ready to apply schema changes safely

**Rollback Point:** If destructive changes found, STOP and review. Backup is in place from Task 1.4.

---

#### Task Group 3.3: Apply Schema Changes to Production
**Dependencies:** Task Group 3.2 (migration planned)
**Estimated Duration:** 10-20 minutes
**Execution:** Sequential
**Specialist:** Backend Engineer
**CRITICAL:** Monitor closely for errors at each step

- [ ] 3.3.0 Complete schema application to production
  - [ ] 3.3.1 Upload local schema to production
    - Access Render backend shell
    - Create upload directory: `mkdir -p /tmp/migration`
    - Upload schema-local.json to production
      - Option 1: Copy/paste JSON content via shell
      - Option 2: Use Render file upload feature
      - Option 3: Store in repo temporarily and git pull (then remove)
    - Verify file present: `ls -lh /tmp/migration/schema-local.json`
  - [ ] 3.3.2 Apply schema using Directus CLI
    - In production shell, navigate to Directus directory
    - Run: `npx directus schema apply --yes /tmp/migration/schema-local.json`
    - Monitor output for errors or warnings
    - Wait for completion
  - [ ] 3.3.3 Verify schema application succeeded
    - Check for success message in output
    - Review any warnings (some are normal)
    - Check for error messages (abort if errors)
  - [ ] 3.3.4 Immediate post-application checks
    - Access Directus admin UI
    - Navigate to Data Model section
    - Verify all new collections visible
    - Verify all new fields visible in existing collections
    - Check relationships are configured
  - [ ] 3.3.5 Test basic CRUD operations
    - For each new collection:
      - Create a test item
      - Read the test item back
      - Update the test item
      - Delete the test item
    - Verify no errors during operations
  - [ ] 3.3.6 Clean up temporary files
    - In production shell: `rm -rf /tmp/migration`
    - Verify cleanup: `ls /tmp/migration` (should not exist)

**Acceptance Criteria:**
- Schema applied successfully without errors
- All new collections and fields visible in admin UI
- Basic CRUD operations work on new collections
- No schema-related errors in logs
- Production database schema matches local schema

**Rollback Point:** If schema application fails:
1. Note the error message
2. STOP immediately - do NOT proceed with data migration
3. Restore database from backup (Task 1.4)
4. Investigate and fix schema issues locally
5. Test schema apply on local/staging environment first
6. Retry migration after fixes verified

---

#### Task Group 3.4: Schema Migration Verification
**Dependencies:** Task Group 3.3 (schema applied)
**Estimated Duration:** 10-15 minutes
**Execution:** Sequential
**Specialist:** Backend Engineer

- [ ] 3.4.0 Complete comprehensive schema verification
  - [ ] 3.4.1 Export production schema again
    - Access Render backend shell
    - Run: `npx directus schema snapshot --format json ./schema-production-post-migration.json`
    - Download to local: `/Users/nick/Sites/charlotteUDO/backend/migration/schema-production-post-migration.json`
  - [ ] 3.4.2 Compare post-migration schema with local
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend/migration`
    - Run: `diff schema-local.json schema-production-post-migration.json`
    - Verify minimal differences (only environment-specific settings)
    - Confirm all collections match
    - Confirm all fields match
  - [ ] 3.4.3 Verify all collections present
    - In Directus admin UI, check Data Model
    - For each collection from local schema:
      - Verify collection exists in production
      - Verify all fields present
      - Verify field types correct
      - Verify validations configured
  - [ ] 3.4.4 Verify all relationships configured
    - Check each relationship from local schema
    - Verify M2O relationships work
    - Verify O2M relationships work
    - Verify M2M relationships work
    - Test navigation between related items
  - [ ] 3.4.5 Test edge cases
    - Test required field validations
    - Test unique field constraints
    - Test default values
    - Test cascade delete (if configured)
  - [ ] 3.4.6 Check for orphaned data
    - Run basic SQL queries to check foreign key integrity
    - Verify no orphaned records created during migration
    - Check all existing data still accessible

**Acceptance Criteria:**
- Production schema matches local schema (verified by diff)
- All collections and fields present and correct
- All relationships configured and working
- Edge cases validated
- No orphaned data or integrity issues
- Schema migration fully verified and stable
- Ready to proceed with data migration

**Rollback Point:** If schema verification fails, restore from backup and investigate.

---

### Phase 4: Directus Data Migration

**CRITICAL:** Execute ONLY after Task Group 3.4 completes successfully and schema is verified

#### Task Group 4.1: Data Import Preparation
**Dependencies:** Task Groups 1.3, 3.4 (data exported and schema verified)
**Estimated Duration:** 10-15 minutes
**Execution:** Sequential
**Specialist:** Backend Engineer

- [ ] 4.1.0 Complete data import preparation
  - [ ] 4.1.1 Review all exported data files
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend/migration/data`
    - List all JSON files: `ls -lh *.json`
    - For each file, check item count: `jq '. | length' <collection_name>.json`
    - Document total items to be imported per collection
  - [ ] 4.1.2 Analyze potential conflicts
    - Check for UUID format consistency
    - Identify collections with unique constraints
    - Check for potential duplicate IDs
    - Note any file upload fields (need special handling)
  - [ ] 4.1.3 Determine import strategy
    - Option 1: Directus CLI import (simpler but may overwrite)
    - Option 2: API-based import with duplicate detection (safer, recommended)
    - Choose based on risk assessment
  - [ ] 4.1.4 Plan import execution order
    - List collections with no foreign keys (import first)
    - List collections with foreign keys (import after dependencies)
    - Create ordered list of collections
    - Document dependencies for each collection
  - [ ] 4.1.5 Create import script (if using API method)
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend/migration`
    - Create file: `import-data.js`
    - Copy import script from spec (Section 4.2)
    - Customize for your specific collections
    - Add error handling and logging
    - Test script logic (dry-run mode if possible)

**Acceptance Criteria:**
- All data files reviewed and validated
- Item counts documented
- Import strategy selected
- Import order planned based on dependencies
- Import script ready (if using API method)
- Ready to execute data import safely

**Rollback Point:** None needed yet - no changes made to production data

---

#### Task Group 4.2: Execute Data Import
**Dependencies:** Task Group 4.1 (import prepared)
**Estimated Duration:** 15-45 minutes (varies with data volume)
**Execution:** Sequential
**Specialist:** Backend Engineer
**CRITICAL:** Monitor output closely for errors

- [ ] 4.2.0 Complete data import execution
  - [ ] 4.2.1 Set up environment for import
    - Get production backend URL from Render dashboard
    - Get admin token from Render environment variables
    - Set environment variables locally:
      - `export DIRECTUS_URL=https://<backend-url>.onrender.com`
      - `export ADMIN_TOKEN=<admin-token>`
    - Verify connection: `curl -H "Authorization: Bearer $ADMIN_TOKEN" $DIRECTUS_URL/users/me`
  - [ ] 4.2.2 Execute import script (API method - RECOMMENDED)
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend/migration`
    - Run: `node import-data.js 2>&1 | tee import-log.txt`
    - Monitor output in real-time
    - Watch for:
      - Items created successfully (✅)
      - Items skipped (already exist) (⏭️)
      - Errors (❌)
    - For each collection, note:
      - Created count
      - Skipped count
      - Error count
  - [ ] 4.2.3 Alternative: Directus CLI import (if needed)
    - Upload data files to production server
    - For each collection in dependency order:
      - Run: `npx directus data import --collection <name> --file <name>.json`
      - Verify import succeeded
      - Check for error messages
    - Note: This method may overwrite existing items
  - [ ] 4.2.4 Handle errors during import
    - If errors occur:
      - Note the error messages
      - Identify which items failed
      - Determine cause (duplicate, foreign key, validation)
      - Fix data locally and retry failed items
      - Or manually create problematic items via admin UI
  - [ ] 4.2.5 Verify import progress
    - After each collection imported:
      - Check item count in Directus admin UI
      - Verify count increased by expected amount
      - Spot-check a few items for data integrity
  - [ ] 4.2.6 Save import logs
    - Ensure import-log.txt captured all output
    - Review for any warnings or errors
    - Keep log for documentation

**Acceptance Criteria:**
- All data files imported successfully
- Import logs show mostly "created" or "skipped" (not errors)
- Item counts in production increased by expected amounts
- No critical errors during import
- Import log saved for reference

**Rollback Point:** If major data corruption occurs:
1. STOP import immediately
2. Assess damage scope
3. Restore database from backup (Task 1.4)
4. Fix import script/data
5. Retry import after fixes verified

---

#### Task Group 4.3: Data Migration Verification
**Dependencies:** Task Group 4.2 (data imported)
**Estimated Duration:** 15-30 minutes
**Execution:** Sequential
**Specialist:** Backend Engineer

- [ ] 4.3.0 Complete comprehensive data verification
  - [ ] 4.3.1 Verify item counts per collection
    - For each imported collection:
      - Via API: `curl "$DIRECTUS_URL/items/<collection>?aggregate[count]=*" -H "Authorization: Bearer $ADMIN_TOKEN"`
      - Via admin UI: Check collection item count
      - Compare with expected count (local count + import count)
      - Document any discrepancies
  - [ ] 4.3.2 Spot-check sample items
    - For each collection, randomly select 3-5 items
    - Check in admin UI that all fields populated correctly
    - Verify data values match local environment
    - Check for any corrupted or malformed data
  - [ ] 4.3.3 Verify relationships intact
    - For items with foreign keys:
      - Open item in admin UI
      - Verify related items load correctly
      - Test M2O relationships (should show dropdown/selection)
      - Test O2M relationships (should show related items list)
      - Test M2M relationships (should show junction table)
  - [ ] 4.3.4 Check for orphaned records
    - Run SQL queries to verify foreign key integrity:
      ```sql
      -- Example: Check for orphaned records
      SELECT * FROM <child_table>
      WHERE <foreign_key_field> NOT IN (SELECT id FROM <parent_table>);
      ```
    - Verify query returns 0 rows (no orphans)
    - Check each relationship defined in schema
  - [ ] 4.3.5 Test data operations
    - Create a new test item in each collection
    - Read items back via API and admin UI
    - Update a test item
    - Delete a test item
    - Verify all operations work without errors
  - [ ] 4.3.6 Check for duplicate entries
    - For collections with unique constraints:
      - Query for duplicate values
      - Verify no unintended duplicates created
    - If duplicates found:
      - Determine if intentional or error
      - Merge or remove duplicates as needed

**Acceptance Criteria:**
- Item counts match expectations for all collections
- Sample items verified and data intact
- All relationships working correctly
- No orphaned records found
- CRUD operations work on all collections
- No duplicate entries (unless intended)
- Data migration fully verified and stable
- Ready for post-migration validation

**Rollback Point:** If data integrity issues found, restore from backup and investigate.

---

### Phase 5: Post-Migration Validation

**CRITICAL:** Final comprehensive validation before declaring migration complete

#### Task Group 5.1: End-to-End Testing
**Dependencies:** Task Group 4.3 (data verified)
**Estimated Duration:** 15-20 minutes
**Execution:** Sequential
**Specialist:** QA/Frontend/Backend Engineers

- [ ] 5.1.0 Complete end-to-end testing
  - [ ] 5.1.1 Test frontend data display
    - Navigate to production frontend URL
    - For each page that uses migrated collections:
      - Verify page loads without errors
      - Check that data displays correctly
      - Verify correct number of items shown
      - Check images/files load (if applicable)
    - Check browser console for JavaScript errors
  - [ ] 5.1.2 Test frontend CRUD operations
    - If frontend allows creating items:
      - Create a test item via frontend
      - Verify item saves successfully
      - Verify item appears in list/grid
    - If frontend allows editing:
      - Edit an existing item
      - Verify changes save
      - Verify changes reflect in display
    - If frontend allows deleting:
      - Delete a test item
      - Verify deletion successful
      - Verify item removed from display
  - [ ] 5.1.3 Test API endpoints
    - For each migrated collection:
      - Test GET /items/<collection> (list)
      - Test GET /items/<collection>/:id (single item)
      - Test POST /items/<collection> (create)
      - Test PATCH /items/<collection>/:id (update)
      - Test DELETE /items/<collection>/:id (delete)
    - Verify all endpoints return correct status codes
    - Verify response data format correct
  - [ ] 5.1.4 Test filtering and sorting
    - Test API filtering: `/items/<collection>?filter[field][_eq]=value`
    - Test API sorting: `/items/<collection>?sort=-field`
    - Test search functionality
    - Verify results are accurate
  - [ ] 5.1.5 Test authentication and permissions
    - Test endpoints with valid auth token
    - Test endpoints without auth (should fail)
    - Test role-based permissions (if configured)
    - Verify unauthorized access properly blocked
  - [ ] 5.1.6 Test critical user workflows
    - Identify 3-5 most important user workflows
    - Execute each workflow end-to-end
    - Verify workflow completes successfully
    - Check for any errors or broken functionality

**Acceptance Criteria:**
- Frontend loads and displays data correctly
- All CRUD operations work via frontend and API
- Filtering, sorting, and search work correctly
- Authentication and permissions enforced
- Critical user workflows complete successfully
- No console errors or API errors
- Application fully functional with migrated data

**Rollback Point:** If major functionality broken, investigate and fix or restore from backup.

---

#### Task Group 5.2: Performance & Resource Check
**Dependencies:** Task Group 5.1 (E2E tested)
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential
**Specialist:** DevOps Engineer

- [ ] 5.2.0 Complete performance and resource validation
  - [ ] 5.2.1 Review Render metrics
    - Navigate to Render dashboard
    - For frontend service, check:
      - CPU usage (should be normal range)
      - Memory usage (should not be near limit)
      - Response times (should be acceptable)
    - For backend service, check:
      - CPU usage (should be normal range)
      - Memory usage (should not be near limit)
      - Response times (should be acceptable)
    - For database, check:
      - Connection count (should be reasonable)
      - Storage usage (increased but not critical)
      - Query performance
  - [ ] 5.2.2 Check database query performance
    - Review Render database metrics
    - Check for slow queries (should be none)
    - Verify no query timeout errors
    - Check connection pool usage
  - [ ] 5.2.3 Test API response times
    - For key API endpoints:
      - Measure response time (should be <500ms)
      - Test with pagination if list is large
      - Verify response times acceptable
  - [ ] 5.2.4 Test frontend load times
    - Use browser DevTools Network tab
    - Measure page load time for key pages
    - Verify load times acceptable (<3 seconds)
    - Check for any slow resources
  - [ ] 5.2.5 Review application logs
    - Check Render logs for frontend
    - Check Render logs for backend
    - Look for any error messages
    - Look for any performance warnings
    - Verify no memory leaks or crashes
  - [ ] 5.2.6 Check for resource alerts
    - Review Render dashboard for any alerts
    - Check for any service health warnings
    - Verify no resource limit alerts

**Acceptance Criteria:**
- CPU and memory usage within normal ranges
- No database performance issues
- API response times acceptable
- Frontend load times acceptable
- No errors or warnings in logs
- No resource alerts or warnings
- Application performing well under current load

**Rollback Point:** If performance severely degraded, investigate cause or restore from backup.

---

#### Task Group 5.3: Data Integrity Audit
**Dependencies:** Task Groups 5.1, 5.2 (testing complete)
**Estimated Duration:** 10-15 minutes
**Execution:** Sequential
**Specialist:** Backend Engineer

- [ ] 5.3.0 Complete final data integrity audit
  - [ ] 5.3.1 Re-export production schema
    - Access Render backend shell
    - Run: `npx directus schema snapshot --format json ./schema-final.json`
    - Download to local: `/Users/nick/Sites/charlotteUDO/backend/migration/schema-final.json`
  - [ ] 5.3.2 Compare final schema with local
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend/migration`
    - Run: `diff schema-local.json schema-final.json`
    - Verify schemas match (minimal environment differences only)
    - Confirm no unexpected schema changes
  - [ ] 5.3.3 Verify all collection item counts
    - For each collection in production:
      - Get count: `curl "$DIRECTUS_URL/items/<collection>?aggregate[count]=*" -H "Authorization: Bearer $ADMIN_TOKEN"`
      - Document final count
      - Compare with expected count (original + imported)
      - Verify counts are correct
  - [ ] 5.3.4 Final check for orphaned relationships
    - Run SQL queries for each foreign key relationship:
      ```sql
      SELECT COUNT(*) as orphaned_count
      FROM <child_table>
      WHERE <foreign_key_field> NOT IN (SELECT id FROM <parent_table>);
      ```
    - Verify all queries return 0 (no orphans)
    - Document results
  - [ ] 5.3.5 Check for data anomalies
    - Look for NULL values in required fields
    - Check for invalid enum values
    - Verify date fields have valid dates
    - Check numeric fields for invalid values
    - Spot-check text fields for encoding issues
  - [ ] 5.3.6 Verify file uploads (if applicable)
    - If collections have file fields:
      - Check that files uploaded during migration
      - Verify files accessible via URL
      - Check file metadata correct
      - Test file download functionality

**Acceptance Criteria:**
- Production schema matches local schema
- All item counts verified and correct
- No orphaned relationships found
- No data anomalies detected
- File uploads working (if applicable)
- Complete data integrity confirmed
- Migration fully successful and validated

**Rollback Point:** If critical data integrity issues found, restore from backup and investigate.

---

### Phase 6: Final Documentation & Cleanup

#### Task Group 6.1: Document Migration Results
**Dependencies:** All Phase 5 tasks complete
**Estimated Duration:** 10-15 minutes
**Execution:** Sequential

- [ ] 6.1.0 Complete migration documentation
  - [ ] 6.1.1 Document final state
    - Create file: `/Users/nick/Sites/charlotteUDO/backend/migration/MIGRATION_REPORT.md`
    - Document:
      - Migration completion date and time
      - Total duration of migration
      - List of collections migrated
      - Item counts before and after per collection
      - Any errors encountered and resolutions
      - Performance impact (if any)
  - [ ] 6.1.2 Document schema changes applied
    - List all new collections created
    - List all new fields added
    - List all relationships created
    - Note any field modifications
  - [ ] 6.1.3 Document data migration results
    - Total items imported per collection
    - Items skipped (duplicates) per collection
    - Any errors during import
    - Final item counts verified
  - [ ] 6.1.4 Document rollback information
    - Backup ID/name from Task 1.4
    - Backup timestamp
    - Backup location
    - Rollback procedure (reference spec Section: Rollback Procedures)
  - [ ] 6.1.5 Create post-migration checklist
    - Document any follow-up tasks needed
    - Note any manual cleanup required
    - List any features to monitor
    - Document any known issues (if any)

**Acceptance Criteria:**
- Migration report created and complete
- All results documented
- Rollback information preserved
- Follow-up tasks identified

---

#### Task Group 6.2: Cleanup & Archival
**Dependencies:** Task Group 6.1 (documentation complete)
**Estimated Duration:** 5-10 minutes
**Execution:** Sequential

- [ ] 6.2.0 Complete cleanup and archival
  - [ ] 6.2.1 Archive migration files locally
    - Navigate to `/Users/nick/Sites/charlotteUDO/backend`
    - Create archive: `tar -czf migration-archive-$(date +%Y%m%d).tar.gz migration/`
    - Move archive to safe location
    - Verify archive created successfully
  - [ ] 6.2.2 Clean up temporary files in production
    - Access Render backend shell
    - Remove any temporary migration files
    - Clean up test data created during validation
    - Verify no orphaned temporary files
  - [ ] 6.2.3 Update project documentation
    - Update project README with migration notes (if applicable)
    - Document new collections and features
    - Update API documentation (if needed)
  - [ ] 6.2.4 Notify stakeholders
    - Inform team of successful migration
    - Share migration report
    - Note any changes that affect workflows
    - Provide rollback contact information
  - [ ] 6.2.5 Schedule follow-up monitoring
    - Plan to check application in 24 hours
    - Monitor error logs for next few days
    - Watch performance metrics
    - Be ready to respond to issues

**Acceptance Criteria:**
- Migration files archived safely
- Production environment cleaned up
- Documentation updated
- Stakeholders notified
- Monitoring plan in place
- Migration complete and production stable

---

## Execution Order Summary

```
Phase 1: Pre-Deployment Validation (Parallel: 1.1, 1.2, 1.3 | Sequential: 1.4)
         └─► Task 1.1: Change Review (5-10 min)
         └─► Task 1.2: Schema Export (5-10 min)
         └─► Task 1.3: Data Export (5-15 min)
         └─► Task 1.4: Database Backup (5-10 min) ⚠️ CRITICAL

Phase 2: Parallel GitHub Push (15-20 min total)
         ├─► Task 2.1: Frontend Push (5-10 min) 🔀 Parallel
         ├─► Task 2.2: Backend Push (5-10 min)  🔀 Parallel
         └─► Task 2.3: Deployment Verification (5-10 min) ⏸️ Wait for 2.1 & 2.2

Phase 3: Schema Migration (35-60 min)
         └─► Task 3.1: Export Production Schema (5-10 min)
         └─► Task 3.2: Schema Comparison (10-15 min)
         └─► Task 3.3: Apply Schema Changes (10-20 min) ⚠️ CRITICAL
         └─► Task 3.4: Verify Schema (10-15 min)

Phase 4: Data Migration (40-90 min)
         └─► Task 4.1: Prepare Import (10-15 min)
         └─► Task 4.2: Execute Import (15-45 min) ⚠️ CRITICAL
         └─► Task 4.3: Verify Data (15-30 min)

Phase 5: Post-Migration Validation (30-45 min)
         └─► Task 5.1: End-to-End Testing (15-20 min)
         └─► Task 5.2: Performance Check (5-10 min)
         └─► Task 5.3: Data Integrity Audit (10-15 min)

Phase 6: Documentation & Cleanup (15-25 min)
         └─► Task 6.1: Document Results (10-15 min)
         └─► Task 6.2: Cleanup & Archive (5-10 min)

TOTAL ESTIMATED TIME: 2.5-4.5 hours
```

## Key Parallel Execution Opportunities

1. **Phase 1**: Tasks 1.1, 1.2, 1.3 can run in parallel (Task 1.4 should run after these complete)
2. **Phase 2**: Tasks 2.1 and 2.2 MUST run in parallel for efficiency
3. **All other phases**: Sequential execution required due to dependencies

## Critical Safety Checkpoints

1. ⚠️ **Checkpoint 1** (Task 1.4): Database backup MUST succeed before Phase 3
2. ⚠️ **Checkpoint 2** (Task 2.3): Both deployments MUST be verified before Phase 3
3. ⚠️ **Checkpoint 3** (Task 3.3): Schema application MUST succeed before Phase 4
4. ⚠️ **Checkpoint 4** (Task 3.4): Schema verification MUST pass before Phase 4
5. ⚠️ **Checkpoint 5** (Task 4.3): Data verification MUST pass before Phase 5

## Rollback Decision Points

| Point | Condition | Action |
|-------|-----------|--------|
| After 1.4 | Backup fails | Fix backup issue, retry |
| After 2.3 | Deployment fails | Use Render rollback or git revert |
| After 3.3 | Schema apply fails | STOP, restore from backup, investigate |
| After 3.4 | Schema verify fails | STOP, restore from backup, investigate |
| After 4.2 | Major data corruption | STOP, restore from backup, fix import |
| After 4.3 | Data verify fails | Restore from backup, investigate |
| After 5.1 | Critical functionality broken | Restore from backup or fix issues |

## Resource Requirements

- **Personnel**: Backend Engineer, Frontend Engineer, DevOps Engineer (for different phases)
- **Access Required**:
  - Render dashboard access
  - GitHub repository write access
  - Directus admin credentials
  - Production database credentials (for backup)
- **Tools Required**:
  - Git CLI
  - Node.js and npm
  - Directus CLI
  - curl or similar API testing tool
  - PostgreSQL client (for backup, optional)
  - jq (for JSON parsing)

## Success Criteria

### Phase 1 Success
- ✅ All changes reviewed and documented
- ✅ Schema and data exported from local
- ✅ Production database backed up

### Phase 2 Success
- ✅ Frontend deployed to Render (master branch)
- ✅ Backend deployed to Render (main branch)
- ✅ Both services accessible and healthy

### Phase 3 Success
- ✅ Production schema matches local schema
- ✅ All new collections and fields present
- ✅ All relationships configured
- ✅ No schema errors

### Phase 4 Success
- ✅ All data imported successfully
- ✅ Item counts match expectations
- ✅ No orphaned records
- ✅ Relationships intact

### Phase 5 Success
- ✅ End-to-end testing passes
- ✅ Performance acceptable
- ✅ Data integrity verified

### Phase 6 Success
- ✅ Migration documented
- ✅ Files archived
- ✅ Team notified

## Final Notes

- **Communication**: Keep stakeholders informed at each phase completion
- **Monitoring**: Watch Render logs and metrics throughout migration
- **Patience**: Don't rush through validation steps - they catch issues early
- **Documentation**: Keep detailed notes of any issues encountered and resolutions
- **Backup Confidence**: Having the backup from Task 1.4 means we can always rollback safely

---

**Ready to execute**: Run `/execute-tasks` to begin the migration process.
