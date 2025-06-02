const { Redis } = require('@upstash/redis');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Authentication middleware
async function authenticateUser(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const { httpMethod, path, queryStringParameters } = event;
    const pathParts = path.split('/').filter(Boolean);
    const noteId = pathParts[pathParts.length - 1];

    // Authenticate user for all requests
    const userId = await authenticateUser(event);

    switch (httpMethod) {
      case 'GET':
        if (noteId && noteId !== 'notes') {
          return await handleGetNote(noteId, userId);
        } else {
          return await handleGetNotes(userId, queryStringParameters);
        }
      case 'POST':
        return await handleCreateNote(event, userId);
      case 'PUT':
        if (noteId) {
          return await handleUpdateNote(event, noteId, userId);
        }
        break;
      case 'DELETE':
        if (noteId) {
          return await handleDeleteNote(noteId, userId);
        }
        break;
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Notes function error:', error);
    return {
      statusCode: error.message === 'No token provided' || error.name === 'JsonWebTokenError' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

async function handleGetNotes(userId, queryParams) {
  try {
    const { search, category, tags, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 20 } = queryParams || {};

    // Get user's note IDs
    const noteIds = await redis.lrange(`user:${userId}:notes`, 0, -1);
    
    if (noteIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ notes: [], total: 0, page: parseInt(page), totalPages: 0 }),
      };
    }

    // Get all notes
    const notesData = await redis.mget(noteIds.map(id => `note:${id}`));
    let notes = notesData
      .filter(data => data !== null)
      .map(data => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch (parseError) {
          console.error('Failed to parse note data:', parseError);
          return null;
        }
      })
      .filter(note => note !== null);

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      notes = notes.filter(note => note.category === category);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      notes = notes.filter(note => 
        note.tags.some(tag => tagArray.includes(tag))
      );
    }

    // Sort notes
    notes.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const total = notes.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const paginatedNotes = notes.slice(offset, offset + limitNum);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        notes: paginatedNotes,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      }),
    };
  } catch (error) {
    console.error('Get notes error:', error);
    throw error;
  }
}

async function handleGetNote(noteId, userId) {
  try {
    const noteData = await redis.get(`note:${noteId}`);
    
    if (!noteData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Note not found' }),
      };
    }

    const note = typeof noteData === 'string' ? JSON.parse(noteData) : noteData;
    
    // Verify ownership
    if (note.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ note }),
    };
  } catch (error) {
    console.error('Get note error:', error);
    throw error;
  }
}

async function handleCreateNote(event, userId) {
  try {
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { title, content, category = 'general', tags = [], isPublic = false } = requestBody;

    if (!title || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Title and content are required' }),
      };
    }

    const noteId = nanoid();
    const now = new Date().toISOString();

    const note = {
      id: noteId,
      userId,
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [],
      isPublic,
      createdAt: now,
      updatedAt: now,
    };

    // Store note
    await redis.set(`note:${noteId}`, JSON.stringify(note));
    
    // Add to user's notes list
    await redis.lpush(`user:${userId}:notes`, noteId);

    // Add to category index if not general
    if (category !== 'general') {
      await redis.sadd(`category:${category}:notes`, noteId);
    }

    // Add to tag indices
    for (const tag of note.tags) {
      await redis.sadd(`tag:${tag}:notes`, noteId);
    }

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ note }),
    };
  } catch (error) {
    console.error('Create note error:', error);
    throw error;
  }
}

async function handleUpdateNote(event, noteId, userId) {
  try {
    const noteData = await redis.get(`note:${noteId}`);
    
    if (!noteData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Note not found' }),
      };
    }

    const existingNote = typeof noteData === 'string' ? JSON.parse(noteData) : noteData;
    
    // Verify ownership
    if (existingNote.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    const updates = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const updatedNote = {
      ...existingNote,
      ...updates,
      id: noteId, // Ensure ID doesn't change
      userId, // Ensure userId doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Handle category changes
    if (updates.category && updates.category !== existingNote.category) {
      // Remove from old category
      if (existingNote.category !== 'general') {
        await redis.srem(`category:${existingNote.category}:notes`, noteId);
      }
      // Add to new category
      if (updates.category !== 'general') {
        await redis.sadd(`category:${updates.category}:notes`, noteId);
      }
    }

    // Handle tag changes
    if (updates.tags) {
      // Remove from old tag indices
      for (const tag of existingNote.tags) {
        await redis.srem(`tag:${tag}:notes`, noteId);
      }
      // Add to new tag indices
      for (const tag of updatedNote.tags) {
        await redis.sadd(`tag:${tag}:notes`, noteId);
      }
    }

    // Store updated note
    await redis.set(`note:${noteId}`, JSON.stringify(updatedNote));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ note: updatedNote }),
    };
  } catch (error) {
    console.error('Update note error:', error);
    throw error;
  }
}

async function handleDeleteNote(noteId, userId) {
  try {
    const noteData = await redis.get(`note:${noteId}`);
    
    if (!noteData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Note not found' }),
      };
    }

    const note = typeof noteData === 'string' ? JSON.parse(noteData) : noteData;
    
    // Verify ownership
    if (note.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    // Remove from all indices
    await redis.del(`note:${noteId}`);
    await redis.lrem(`user:${userId}:notes`, 0, noteId);
    
    if (note.category !== 'general') {
      await redis.srem(`category:${note.category}:notes`, noteId);
    }
    
    for (const tag of note.tags) {
      await redis.srem(`tag:${tag}:notes`, noteId);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Note deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete note error:', error);
    throw error;
  }
}
