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
    const { httpMethod, path } = event;
    const pathParts = path.split('/').filter(Boolean);
    const typeId = pathParts[pathParts.length - 1];

    // Authenticate user for all requests
    const userId = await authenticateUser(event);

    switch (httpMethod) {
      case 'GET':
        if (typeId && typeId !== 'note-types') {
          return await handleGetNoteType(typeId, userId);
        } else {
          return await handleGetNoteTypes(userId);
        }
      case 'POST':
        return await handleCreateNoteType(event, userId);
      case 'PUT':
        if (typeId) {
          return await handleUpdateNoteType(event, typeId, userId);
        }
        break;
      case 'DELETE':
        if (typeId) {
          return await handleDeleteNoteType(typeId, userId);
        }
        break;
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Note types function error:', error);
    return {
      statusCode: error.message === 'No token provided' || error.name === 'JsonWebTokenError' ? 401 : 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

async function handleGetNoteTypes(userId) {
  try {
    // Get user's note type IDs
    const typeIds = await redis.lrange(`user:${userId}:note-types`, 0, -1);
    
    if (typeIds.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ noteTypes: [] }),
      };
    }

    // Get all note types
    const typesData = await redis.mget(typeIds.map(id => `note-type:${id}`));
    const noteTypes = typesData
      .filter(data => data !== null)
      .map(data => JSON.parse(data))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ noteTypes }),
    };
  } catch (error) {
    console.error('Get note types error:', error);
    throw error;
  }
}

async function handleGetNoteType(typeId, userId) {
  try {
    const typeData = await redis.get(`note-type:${typeId}`);
    
    if (!typeData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Note type not found' }),
      };
    }

    const noteType = JSON.parse(typeData);
    
    // Verify ownership
    if (noteType.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ noteType }),
    };
  } catch (error) {
    console.error('Get note type error:', error);
    throw error;
  }
}

async function handleCreateNoteType(event, userId) {
  try {
    const { name, description, color, icon, fields = [] } = JSON.parse(event.body);

    if (!name) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Name is required' }),
      };
    }

    // Check if note type with same name already exists for this user
    const existingTypeIds = await redis.lrange(`user:${userId}:note-types`, 0, -1);
    for (const existingId of existingTypeIds) {
      const existingData = await redis.get(`note-type:${existingId}`);
      if (existingData) {
        const existingType = JSON.parse(existingData);
        if (existingType.name.toLowerCase() === name.toLowerCase()) {
          return {
            statusCode: 409,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Note type with this name already exists' }),
          };
        }
      }
    }

    const typeId = nanoid();
    const now = new Date().toISOString();

    const noteType = {
      id: typeId,
      userId,
      name,
      description: description || '',
      color: color || '#6366f1',
      icon: icon || 'FileText',
      fields: Array.isArray(fields) ? fields : [],
      createdAt: now,
      updatedAt: now,
    };

    // Store note type
    await redis.set(`note-type:${typeId}`, JSON.stringify(noteType));
    
    // Add to user's note types list
    await redis.lpush(`user:${userId}:note-types`, typeId);

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({ noteType }),
    };
  } catch (error) {
    console.error('Create note type error:', error);
    throw error;
  }
}

async function handleUpdateNoteType(event, typeId, userId) {
  try {
    const typeData = await redis.get(`note-type:${typeId}`);
    
    if (!typeData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Note type not found' }),
      };
    }

    const existingType = JSON.parse(typeData);
    
    // Verify ownership
    if (existingType.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    const updates = JSON.parse(event.body);

    // If name is being updated, check for conflicts
    if (updates.name && updates.name.toLowerCase() !== existingType.name.toLowerCase()) {
      const existingTypeIds = await redis.lrange(`user:${userId}:note-types`, 0, -1);
      for (const existingId of existingTypeIds) {
        if (existingId === typeId) continue; // Skip current type
        const existingData = await redis.get(`note-type:${existingId}`);
        if (existingData) {
          const existingType = JSON.parse(existingData);
          if (existingType.name.toLowerCase() === updates.name.toLowerCase()) {
            return {
              statusCode: 409,
              headers: corsHeaders,
              body: JSON.stringify({ error: 'Note type with this name already exists' }),
            };
          }
        }
      }
    }

    const updatedType = {
      ...existingType,
      ...updates,
      id: typeId, // Ensure ID doesn't change
      userId, // Ensure userId doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Store updated note type
    await redis.set(`note-type:${typeId}`, JSON.stringify(updatedType));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ noteType: updatedType }),
    };
  } catch (error) {
    console.error('Update note type error:', error);
    throw error;
  }
}

async function handleDeleteNoteType(typeId, userId) {
  try {
    const typeData = await redis.get(`note-type:${typeId}`);
    
    if (!typeData) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Note type not found' }),
      };
    }

    const noteType = JSON.parse(typeData);
    
    // Verify ownership
    if (noteType.userId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    // Check if any notes are using this type
    const userNoteIds = await redis.lrange(`user:${userId}:notes`, 0, -1);
    let notesUsingType = 0;
    
    for (const noteId of userNoteIds) {
      const noteData = await redis.get(`note:${noteId}`);
      if (noteData) {
        const note = JSON.parse(noteData);
        if (note.noteTypeId === typeId) {
          notesUsingType++;
        }
      }
    }

    if (notesUsingType > 0) {
      return {
        statusCode: 409,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `Cannot delete note type. ${notesUsingType} note(s) are using this type.` 
        }),
      };
    }

    // Delete note type
    await redis.del(`note-type:${typeId}`);
    await redis.lrem(`user:${userId}:note-types`, 0, typeId);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Note type deleted successfully' }),
    };
  } catch (error) {
    console.error('Delete note type error:', error);
    throw error;
  }
}
