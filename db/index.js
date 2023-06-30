
const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

//USER Methods

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, 
      username,
      name,
      location,
      active
      FROM users;
    `
  );

  return rows;
}

async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO users (username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `,
      [username, password, name, location]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [ user ] } = await client.query(
      `
           UPDATE users
           SET ${setString}
           WHERE id=${id}
           RETURNING *; 
           `, 
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
    try {
      const { rows: [ user ] } = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE id=${ userId }
      `);
  
      if (!user) {
        return null
      }
  
      user.posts = await getPostsByUser(userId);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

// POST Methods


async function createPost({
    authorid,
    title,
    content
  }) {
    try {
      const { rows: [ post ] } = await client.query(`
        INSERT INTO posts("authorid", title, content) 
        VALUES($1, $2, $3)
        RETURNING *;
      `, [authorid, title, content]);
  
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  async function updatePost(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ post ] } = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return post;
    } catch (error) {
      throw error;
    }
  }
  
/*   async function getAllPosts() {
    try {
      const { rows } = await client.query(`
        SELECT *
        FROM posts;
      `);
  
      return rows;
    } catch (error) {
      throw error;
    }
  } */

  async function getAllPosts() {
    try {
      const { rows } = await client.query(`
        SELECT *
        FROM posts;
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  
  
  async function getPostsByUser(userId) {
    try {
      const { rows: postids } = await client.query(`
        SELECT id 
        FROM posts 
        WHERE "authorid"=$1;
      `, [userId]);
  
      const posts = await Promise.all(postids.map(
        post => getPostById( post.id )
      ));
  
      return posts;
    } catch (error) {
      throw error;
    }
  }

  async function createTags(tagList) {
    if (tagList.length === 0) {
      return;
    }
    // need something like: $1), ($2), ($3
    const insertValues = tagList.map(
      (_, index) => `$${index + 1}`).join('), (');
    // then we can use: (${ insertValues }) in our string template
    // need something like $1, $2, $3
    const selectValues = tagList.map(
      (_, index) => `$${index + 1}`).join(', ');
    // then we can use (${ selectValues }) in our string template
    try {
      console.log(insertValues)
      // insert the tags, doing nothing on conflict
      // returning nothing, we'll query after
      const { rows: [tags] } = await client.query(`
        INSERT INTO tags(name)
        VALUES (${insertValues});
      `, tagList);
      // select all tags where the name is in our taglist
      // return the rows from the query
      console.log(selectValues)
      const { rows } = await client.query(`
        SELECT * FROM tags
        WHERE name
        IN (${selectValues});
      `, tagList);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  
  
  async function createPostTag(postid, tagid) {
    try {
      await client.query(`
        INSERT INTO post_tags("postid", "tagid")
        VALUES ($1, $2);
      `, [postid, tagid]);
    } catch (error) {
      throw error;
    }
  }


  
/*   async function getPostById(postId) {
    try {
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postId]);
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `, [postId])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authorId])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorId;
  
      return post;
    } catch (error) {
      throw error;
    }
  } */

  async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
        authorid: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them."
      });
  
      // a couple more
    } catch (error) {
      throw error;
    }
  }

  async function addTagsToPost(postid, tagList) {
    try {
      const createPostTagPromises = tagList.map(
        tag => createPostTag(postid, tag.id)
      );
  
      await Promise.all(createPostTagPromises);
  
      return await getPostById(postid);
    } catch (error) {
      throw error;
    }
  }

  async function getPostById(postid) {
    try {
      const { rows: [ post ]  } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
      `, [postid]);
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagid"
        WHERE post_tags."postid"=$1;
      `, [postid])
  
      const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `, [post.authortd])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorid;
  
      return post;
    } catch (error) {
      throw error;
    }
  }
  
  module.exports = {  
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    createPostTag,
    getPostById,
    createPostTag,
    createInitialPosts,
    addTagsToPost,
    createTags
  }
