const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Function to list all blog posts
async function listBlogPosts() {
  try {
    const postSlugs = await redis.lrange('blog:posts_list', 0, -1);
    if (!postSlugs || postSlugs.length === 0) {
      console.log('No blog posts found.');
      return [];
    }
    
    console.log(`Found ${postSlugs.length} blog posts:`);
    for (const slug of postSlugs) {
      const post = await redis.hgetall(`blog:post:${slug}`);
      if (post && post.id) {
        console.log(`- ${post.title} (${slug})`);
      }
    }
    return postSlugs;
  } catch (error) {
    console.error('Error listing blog posts:', error);
    return [];
  }
}

// Function to delete all blog posts
async function deleteAllBlogPosts() {
  try {
    console.log('Checking for existing blog posts...');
    const postSlugs = await redis.lrange('blog:posts_list', 0, -1);
    
    if (!postSlugs || postSlugs.length === 0) {
      console.log('No blog posts found to delete.');
      return;
    }
    
    console.log(`Found ${postSlugs.length} blog posts. Deleting...`);
    
    // Delete each blog post
    for (const slug of postSlugs) {
      await redis.del(`blog:post:${slug}`);
      console.log(`Deleted post: ${slug}`);
    }
    
    // Clear the posts list
    await redis.del('blog:posts_list');
    console.log('Cleared blog posts list.');
    
    console.log(`Successfully deleted ${postSlugs.length} blog posts.`);
  } catch (error) {
    console.error('Error deleting blog posts:', error);
  }
}

// Function to delete a specific blog post
async function deleteBlogPost(slug) {
  try {
    const post = await redis.hgetall(`blog:post:${slug}`);
    if (!post || !post.id) {
      console.log(`Blog post with slug "${slug}" not found.`);
      return;
    }
    
    await redis.del(`blog:post:${slug}`);
    await redis.lrem('blog:posts_list', 1, slug);
    console.log(`Successfully deleted blog post: ${slug}`);
  } catch (error) {
    console.error(`Error deleting blog post ${slug}:`, error);
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      await listBlogPosts();
      break;
      
    case 'delete-all':
      await deleteAllBlogPosts();
      break;
      
    case 'delete':
      const slug = args[1];
      if (!slug) {
        console.log('Please provide a slug: npm run manage-blog delete <slug>');
        return;
      }
      await deleteBlogPost(slug);
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run manage-blog list           - List all blog posts');
      console.log('  npm run manage-blog delete-all     - Delete all blog posts');
      console.log('  npm run manage-blog delete <slug>  - Delete a specific blog post');
      break;
  }
  
  process.exit(0);
}

main().catch(console.error);