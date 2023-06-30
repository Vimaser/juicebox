const {  
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    createTags,
    createPostTag,
    getPostById,
    addTagsToPost,
    createInitialPosts,
    getPostsByUser
   
  } = require('./index');

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");

        await createUser ({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Al Bert', active: "true" })
        await createUser ({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't tellin'", active: "true" })
        await createUser ({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side', active: "true" })
        

        console.log("Finished creating users!");
    } catch(error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function dropTables() {
    try {
      console.log("Starting to drop tables...");
  
      // have to make sure to drop in correct order
      await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
  
      console.log("Finished dropping tables!");
    } catch (error) {
      console.error("Error dropping tables!");
      throw error;
    }
  }


/*   async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name varchar(255) NOT NULL,
          location varchar(255) NOT NULL,
          active boolean DEFAULT true
        );
  
        CREATE TABLE tags (
          id SERIAL PRIMARY KEY,
          name varchar(255) UNIQUE NOT NULL
        );
  
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          authorId INTEGER REFERENCES users(id),
          title varchar(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );
  
        CREATE TABLE post_tags (
          postId INTEGER REFERENCES posts(id),
          tagId INTEGER REFERENCES tags(id),
          CONSTRAINT unique_post_tag UNIQUE (postId, tagId)
        );
      `);
  
      console.log("Finished building tables...");
    } catch (error) {
      console.error("Error building tables:", error);
      throw error;
    }
  }
   */
  
  async function createTables() {
    try {
      console.log("Starting to build tables...");
  
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name varchar(255) NOT NULL,
          location varchar(255) NOT NULL,
          active boolean DEFAULT true
        );
  
        CREATE TABLE tags (
          id SERIAL PRIMARY KEY,
          name varchar(255) UNIQUE NOT NULL
        );
  
        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          authorid INTEGER REFERENCES users(id),
          title varchar(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );
  
        CREATE TABLE post_tags (
          postid INTEGER REFERENCES posts(id),
          tagId INTEGER REFERENCES tags(id),
          CONSTRAINT unique_post_tag UNIQUE (postid, tagId)
        );
      `);
  
      console.log("Finished building tables...");
    } catch (error) {
      console.error("Error building tables:", error);
      throw error;
    }
  }
  
  

/* async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy',
        '#worst-day-ever',
        '#youcandoanything',
        '#catmandoeverything'
      ]);
  
      const [postOne, postTwo, postThree] = await getAllPosts();
  
      await addTagsToPost(postOne.id, [happy, inspo]);
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
  } */
  
  async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const tags = await createTags([
        '#happy',
        '#worst-day-ever',
        '#youcandoanything',
        '#catmandoeverything',
      ]);
  
      console.log("Tags created:", tags);
  
      const posts = await getAllPosts();
      console.log("Posts:", posts);
  
      const [postOne, postTwo, postThree] = posts;
  
      console.log("Adding tags to postOne:", postOne, tags[0], tags[2]);
      if (postOne && tags[0] && tags[2]) {
        await addTagsToPost(postOne.id, [tags[0].id, tags[2].id]);
      }
  
      console.log("Adding tags to postTwo:", postTwo, tags[1], tags[2]);
      if (postTwo && tags[1] && tags[2]) {
        await addTagsToPost(postTwo.id, [tags[1].id, tags[2].id]);
      }
  
      console.log("Adding tags to postThree:", postThree, tags[0], tags[3], tags[2]);
      if (postThree && tags[0] && tags[3] && tags[2]) {
        await addTagsToPost(postThree.id, [tags[0].id, tags[3].id, tags[2].id]);
      }
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
  }
  
  

  
  

  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
      await createInitialTags();
    } catch (error) {
      console.log("Error during rebuildDB")
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
  
      console.log("Tags created:", tags);
  
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
  

  async function testDB() {
    try {
      console.log("Starting to test database...");
  
      console.log("Calling getAllUsers");
      const users = await getAllUsers();
      console.log("Result:", users);
  
      console.log("Calling updateUser on users[0]");
      const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult);
  
      console.log("Calling getAllPosts");
      const posts = await getAllPosts();
      console.log("Result:", posts);
  
      console.log("Calling updatePost on posts[0]");
      const updatePostResult = await updatePost(posts[0].id, {
        title: "New Title",
        content: "Updated Content"
      });
      console.log("Result:", updatePostResult);
  
      console.log("Calling getUserById with 1");
      const albert = await getUserById(1);
      console.log("Result:", albert);
      
      console.log("Calling getPostsById");
    const postById = await getPostById(1)
    console.log("Post:", postById)
      
      console.log("Finished database tests!");
    } catch (error) {
      console.log("Error during testDB");
      throw error;
    }
  }
  
      async function rebuildDB() {
        try {
          client.connect();
      
          await dropTables();
          await createTables();
          await createInitialUsers();
          await createInitialPosts();
          await createInitialTags(); // new
        } catch (error) {
          console.log("Error during rebuildDB")
          throw error;
        }
      }
      
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());

