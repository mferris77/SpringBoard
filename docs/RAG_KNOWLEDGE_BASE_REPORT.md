# RAG Knowledge Base - Technical Report

## Overview

The RAG (Retrieval-Augmented Generation) Knowledge Base is a local vector database that stores documents and their embeddings for semantic search. It's used by the Gateway to provide context-aware responses based on your personal knowledge base.

---

## Location & Storage

| Property | Value |
|----------|-------|
| **Database File** | `/home/amos/.openclaw/workspace/comms/knowledge-base.db` |
| **Database Type** | SQLite |
| **Size** | ~467KB (as of last check) |
| **Table Count** | 2 (`documents`, `embeddings`) |

---

## Database Schema

### Table: `documents`
Stores the source documents/content.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `url` | TEXT | Source URL (if applicable) |
| `title` | TEXT | Document title |
| `content` | TEXT | Full document content |
| `source_type` | TEXT | Type: `url`, `text`, `file`, etc. |
| `source_name` | TEXT | Name of source |
| `entities` | TEXT | JSON array of extracted entities |
| `created_at` | TIMESTAMP | When added |
| `content_hash` | TEXT | SHA256 hash for deduplication |

### Table: `embeddings`
Stores vector embeddings for semantic search.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `document_id` | INTEGER | Foreign key to `documents` |
| `chunk_index` | INTEGER | Order of chunk within document |
| `chunk_text` | TEXT | Text chunk |
| `embedding` | TEXT | JSON-serialized float array |

---

## API Endpoints (Gateway Port 8090)

### GET `/rag/search`
Semantic search of the knowledge base.

**Parameters:**
- `q` (required): Search query string
- `limit` (optional, default=5): Number of results

**Example:**
```bash
curl "http://127.0.0.1:8090/rag/search?q=how+to+configure+openclaw&limit=3"
```

**Response:**
```json
{
  "results": [
    {
      "id": 3,
      "title": "OpenClaw - Documentation",
      "url": "https://docs.openclaw.ai",
      "content": "...",
      "score": 0.85
    }
  ]
}
```

### POST `/rag/add` (Not Fully Implemented)
Add a document to the knowledge base.

**Parameters (query params):**
- `url`: Source URL
- `title`: Document title
- `content`: Document content

**Note:** Full implementation with chunking and embeddings is pending. For now, use the CLI tool `knowledge_base.py`.

---

## Embedding Model

| Property | Value |
|----------|-------|
| **Model** | `text-embedding-nomic-embed-text-v1.5@q8_0` |
| **Provider** | LM Studio (local) |
| **Endpoint** | `http://192.168.1.179:1234/v1/embeddings` |
| **Dimensions** | 768 (typical for this model) |

---

## Current Contents

As of the last check, the database contains **3 documents**:

1. **Test Doc** - Generic test document about ML/AI
2. **Example Domain** - IANA example domain docs
3. **OpenClaw Documentation** - Full content from https://docs.openclaw.ai

---

## How It Works

1. **Query Embedding**: When you search, the query is sent to LM Studio to generate a vector embedding
2. **Similarity Search**: The query embedding is compared against all document embeddings using cosine similarity
3. **Results**: Top-k most similar documents are returned with relevance scores

---

## For Copilot/Electron Integration

### How to Query from Electron

**HTTP Request:**
```javascript
const response = await fetch('http://192.168.1.179:8090/rag/search?q=YOUR_QUERY&limit=5');
const data = await response.json();
// data.results contains array of {id, title, url, content, score}
```

**Important Notes:**
- Gateway must be running (`openclaw gateway start`)
- Electron must be on the same network or have access to the Gateway host
- The LM Studio server must be running at `192.168.1.179:1234` for embeddings to work

### CRUD Interface Recommendations

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| **Search** | GET | `/rag/search?q=&limit=` | Main use case |
| **List All** | GET | `/tickets` (not relevant) | N/A - use direct DB query |
| **Add Doc** | POST | `/rag/add` | Currently limited |
| **Delete** | N/A | - | Not implemented yet |

### Direct Database Access (Alternative)

For full CRUD, you can access the SQLite database directly:

```javascript
const Database = require('sql.js');
const fs = require('fs');

const SQL = await initSqlJs();
const data = fs.readFileSync('/home/amos/.openclaw/workspace/comms/knowledge-base.db');
const db = new SQL.Database(data);

// Query documents
const results = db.exec("SELECT * FROM documents WHERE title LIKE '%openclaw%'");
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Search returns empty | Ensure LM Studio is running with the embedding model loaded |
| Connection refused | Check Gateway is running on port 8090 |
| No embeddings found | Documents may not have been processed with embeddings |

---

## Future Enhancements

- Full `/rag/add` implementation with automatic chunking
- `/rag/delete` endpoint for removing documents
- Web UI for manual management
- Support for more embedding models
