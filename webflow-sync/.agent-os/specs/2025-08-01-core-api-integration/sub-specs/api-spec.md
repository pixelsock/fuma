# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-01-core-api-integration/spec.md

## Endpoints

### GET https://admin.charlotteudo.org/items/{articleID}

**Purpose:** Fetch individual article content from Directus CMS
**Parameters:** 
- `articleID` (path parameter) - The unique identifier for the article
**Response:** JSON object containing article data
**Errors:** 
- 404: Article not found
- 500: Server error
- Network errors: Connection issues

## Expected Response Structure

```json
{
  "data": {
    "id": "string",
    "content": "HTML string containing article content",
    "title": "string (optional)",
    "status": "published|draft",
    // other fields may exist but are not used in Phase 1
  }
}
```

## Client Implementation

### API Client Module

**Action:** fetchArticle(articleId)
**Business Logic:** 
- Construct full URL with articleId
- Add appropriate headers (Accept: application/json)
- Handle response parsing
- Extract content field from response
**Error Handling:**
- Return null for 404 errors
- Throw error for network/server issues
- Log errors to console in development mode

## Integration Points

The API client will be called by the DOM scanner for each discovered element with a data-article-id attribute. No authentication is required for public content access in Phase 1.