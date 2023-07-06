
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
    content,
    tags = []
  }) {
    try {
      const { rows: [ post ] } = await client.query(`
        INSERT INTO posts("authorid", title, content) 
        VALUES($1, $2, $3)
        RETURNING *;
      `, [authorid, title, content]);

      const tagList = await createTags(tags);
  
      return await addTagsToPost(post.id, tagList); //post;
    } catch (error) {
      throw error;
    }
  }
  

  async function updatePost(postid, fields = {}) {
    // read off the tags & remove that field
    const { tags } = fields; // might be undefined
    delete fields.tags;
  
    // build the set string
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(', ');
  
    try {
      // update any fields that need to be updated
      if (setString.length > 0) {
        await client.query(
          `
          UPDATE posts
          SET ${setString}
          WHERE id=$${Object.keys(fields).length + 1}
          RETURNING *;
        `,
          [...Object.values(fields), postid]
        );
      }
  
      // return early if there are no tags to update
      if (tags === undefined) {
        return await getPostById(postid);
      }
  
      // make any new tags that need to be made
      const tagList = await createTags(tags);
      const tagListIdString = tagList.map((tag) => `${tag.id}`).join(', ');
  
      // delete any post_tags from the database which aren't in that tagList
      await client.query(
        `
        DELETE FROM post_tags
        WHERE "tagid" NOT IN (${tagListIdString})
        AND "postid"=$1;
        `,
        [postid]
      );
  
      // create post_tags as necessary
      await addTagsToPost(postid, tagList);
  
      return await getPostById(postid);
    } catch (error) {
      throw error;
    }
  }

  async function getAllPosts() {
    try {
      const { rows: postids } = await client.query(`
        SELECT id
        FROM posts;
      `);

      const posts = await Promise.all(postids.map(
        post => getPostById( post.id )
      ));

      return posts;
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
      return [];
    }
  
    try {
      // Prepare the VALUES clause for the INSERT statement
      const insertValues = tagList.map((_, index) => `($${index + 1})`).join(', ');
      // Prepare the parameter values for the INSERT statement
      const insertParams = tagList.map((tagName) => tagName);
  
      // Insert the tags, ignoring conflicts
      await client.query(`
        INSERT INTO tags(name)
        VALUES ${insertValues}
        ON CONFLICT (name) DO NOTHING;
      `, insertParams);
  
      // Select all tags where the name is in our tagList
      const { rows } = await client.query(`
        SELECT * FROM tags
        WHERE name IN (${insertValues});
      `, insertParams);
  
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

  async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const tags = await createTags([
        '#happy',
        '#worst-day-ever',
        '#youcandoanything',
        '#catmandoeverything',
      ]);
  
      //console.log("Tags created:", tags);
  
      const posts = await getAllPosts();
      console.log("Posts:", posts);
  
      const [postOne, postTwo, postThree] = posts;
  
      console.log("Adding tags to postOne:", postOne, tags[0], tags[2]);
      if (postOne && tags[0] && tags[2]) {
        await addTagsToPost(postOne.id, [tags[0].id, tags[2].id]);
      } else {
        console.log("Skipping adding tags to postOne:", postOne, tags[0], tags[2]);
      }
  
      console.log("Adding tags to postTwo:", postTwo, tags[1], tags[2]);
      if (postTwo && tags[1] && tags[2]) {
        await addTagsToPost(postTwo.id, [tags[1].id, tags[2].id]);
      } else {
        console.log("Skipping adding tags to postTwo:", postTwo, tags[1], tags[2]);
      }
  
      console.log("Adding tags to postThree:", postThree, tags[0], tags[3], tags[2]);
      if (postThree && tags[0] && tags[3] && tags[2]) {
        await addTagsToPost(postThree.id, [tags[0].id, tags[3].id, tags[2].id]);
      } else {
        console.log("Skipping adding tags to postThree:", postThree, tags[0], tags[3], tags[2]);
      }
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
  }

  async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      await createPost({
        authorid: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
      }); 

      await createPost({
        authorid: sandra.id,
        title: "helloWorld!",
        content: "Hello world, just introducing myself here!",
        tags: ["#happy", "#worst-day-ever"]
      });

      await createPost({
        authorid: glamgal.id,
        title: "Sup",
        content: "How you guys doing? New here.",
        tags: ["#happy", "canmandoeverything", "#youcandoanything"]
      });
  
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
      `, [post.authorid])
  
      post.tags = tags;
      post.author = author;
  
      delete post.authorid;
  
      return post;
    } catch (error) {
      throw error;
    }
  }

  async function getPostsByTagName(tagName) {
    try {
      const { rows: postids } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postid"
        JOIN tags ON tags.id=post_tags."tagid"
        WHERE tags.name=$1;
      `, [tagName]);
  
      return await Promise.all(postids.map(
        post => getPostById(post.id)
      ));
    } catch (error) {
      throw error;
    }
  } 


  async function getAllTags() {
    try {
      const { rows: tags } = await client.query(`
        SELECT name
        FROM tags;
      `);
      return tags.map(tag => tag.name);
    } catch (error) {
      throw error;
    }
  }

  async function getUserByUsername(username) {
    try {
      const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1;
      `, [username]);

      return user;
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
    createInitialTags,
    getPostsByTagName,
    createTags,
    getUserByUsername,
    getAllTags
  }