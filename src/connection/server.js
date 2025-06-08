const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("./database");
const authenticateToken = require("./authMiddleware");
require("dotenv").config();
console.log("JWT Secret:", process.env.JWT_SECRET); 

const app = express();
app.use(cors({
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"]
}));
app.use(express.json());
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));

const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({ storage: storage });
// Upload file route (used by frontend to upload an image/file before submitting form)
app.post('/upload-file', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // You can return the filename so frontend can use it when posting documentation
    return res.status(200).json({ 
      message: 'File uploaded successfully',
      filePath: `/uploads/${file.filename}` // Optional: useful for later usage
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Registration route
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await pool.query("SELECT * FROM devUsers WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO devUsers (username, email, password_hash) VALUES ($1, $2, $3)",
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully" });
        console.log("Username:", username, "\nEmail:", email, "\nPassword:", password);
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT id, username, password_hash FROM devUsers WHERE username = $1",
            [username]
        );

        if (result.rows.length === 0) {
            console.log("User not found:", username);
            return res.status(401).json({ message: "User not found" });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.json({ token });
        console.log("Username:", username, "\nPassword:", password ,"\nUserID:",user.userId);
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE Account Route
app.delete("/delete-account", async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { password } = req.body;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const userResult = await pool.query(
            "SELECT id, password_hash FROM devUsers WHERE id = $1",
            [userId]
        );

        const user = userResult.rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return res.status(401).json({ message: "Incorrect password" });

        await pool.query("DELETE FROM devUsers WHERE id = $1", [userId]);

        res.status(200).json({ message: "Account deleted successfully" });

    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Profile Info
app.get("/get-profile-info", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const result = await pool.query(
            "SELECT id,username, email,role FROM devUsers WHERE id = $1",
            [userId]
        );

        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ id:user.id,username: user.username, email: user.email,role:user.role });
    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Profile Route
app.put("/update-profile", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { newUsername, newEmail } = req.body;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Check if the new username already exists (if changed)
        if (newUsername) {
            const existingUser = await pool.query("SELECT * FROM devUsers WHERE username = $1", [newUsername]);
            if (existingUser.rows.length > 0 && existingUser.rows[0].id !== userId) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        await pool.query(
            `UPDATE devUsers 
             SET username = COALESCE($1, username), 
                 email = COALESCE($2, email) 
             WHERE id = $3`,
            [newUsername || null, newEmail || null, userId]
        );

        res.status(200).json({ message: "Profile updated successfully" });

    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


app.post('/documentation',authenticateToken, async (req, res) => {
  try {
    const {
      resource_name,
      resource_color,
      resource_version,
      resource_type,
      resource_title,
      resource_content,
    } = req.body;

    const resource_author = req.user.userId;
    console.log("resource_author",resource_author)
    // Check if this is a new or existing resource
    const isNewResource = await pool.query(
      `SELECT COUNT(*) FROM documentation WHERE resource_name = $1`,
      [resource_name]
    );

    if (isNewResource.rows[0].count === '0') {
      await pool.query(`INSERT INTO color(resource_name,resource_color) VALUES ($1 , $2)`,
        [
          resource_name,resource_color
        ]
      )
    } else {
      // Existing Resource: version must not exist for this resource_name
      const versionExists = await pool.query(
        `SELECT * FROM documentation WHERE resource_name = $1 AND resource_version = $2`,
        [resource_name, resource_version]
      );

      if (versionExists.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "This version already exists for the selected resource." });
      }
    }

    // Proceed with insertion
    await pool.query(
      `INSERT INTO documentation (
        resource_type, 
        resource_name, 
        resource_version, 
        resource_created_at, 
        resource_title, 
        resource_content, 
        resource_author
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)`,
      [
        resource_type,
        resource_name,
        resource_version,
        resource_title,
        resource_content,
        resource_author
      ]
    );

    res.status(201).json({ message: "Documentation created successfully" });
  } catch (err) {
    console.error("Error creating documentation:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Get all documentation entries
app.get("/documentation/filter", async (req, res) => {
  const { resourceType, resourceName, resourceVersion } = req.query;

  try {
      const result = await pool.query(
          `SELECT * FROM documentation 
           WHERE resource_type = $1 AND resource_name = $2 AND resource_version = $3`,
          [resourceType, resourceName, resourceVersion]
      );

      res.json(result.rows);
  } catch (err) {
      console.error("Fetch filtered documentation error:", err);
      res.status(500).json({ message: "Server error" });
  }
});

app.get("/color", async (req, res) => {
  const { resourceName } = req.query;
  try {
      const result = await pool.query(
          `SELECT * FROM color 
           WHERE resource_name = $1`,
          [resourceName]
      );

      res.json(result.rows);
  } catch (err) {
      console.error("Fetch colors error:", err);
      res.status(500).json({ message: "Server error" });
  }
});

app.get('/documentation/names', async (req, res) => {
  const { resourceType } = req.query;

  try {
    const result = await pool.query(
      'SELECT DISTINCT resource_name FROM documentation WHERE resource_type = $1',
      [resourceType]
    );

    // Ensure result.rows is an array and contains the expected data
    if (Array.isArray(result.rows)) {
      const names = result.rows.map(n => n.resource_name); // Extract the resource_name from each row
      res.json(names);
    } else {
      res.status(500).json({ message: "Unexpected database result format" });
    }
  } catch (err) {
    console.error("Error fetching resource names:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/documentation/versions', async (req, res) => {
  const { resourceType, resourceName } = req.query;

  try {
    const result = await pool.query(
      'SELECT DISTINCT resource_version FROM documentation WHERE resource_type = $1 AND resource_name = $2',
      [resourceType, resourceName]
    );
    
    // Ensure result.rows is an array and contains the expected data
    if (Array.isArray(result.rows)) {
      const versions = result.rows.map(v => v.resource_version); // Extract the resource_version from each row
      res.json(versions);
    } else {
      res.status(500).json({ message: "Unexpected database result format" });
    }
  } catch (err) {
    console.error("Error fetching resource versions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/check/resource-name', async (req, res) => {
    const { resourceName } = req.query;
  
    if (!resourceName) {
      return res.status(400).json({ message: "resourceName query parameter is required" });
    }
  
    try {
      const result = await pool.query(
        'SELECT 1 FROM documentation WHERE resource_name = $1 LIMIT 1',
        [resourceName]
      );
  
      if (result.rows.length > 0) {
        return res.json({ exists: true });
      } else {
        return res.json({ exists: false });
      }
    } catch (err) {
      console.error("Error checking resource name:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get('/check/resource-version', async (req, res) => {
    const { resourceName, resourceVersion } = req.query;
  
    if (!resourceName || !resourceVersion) {
      return res.status(400).json({ message: "resourceName and resourceVersion query parameters are required" });
    }
  
    try {
      const result = await pool.query(
        'SELECT 1 FROM documentation WHERE resource_name = $1 AND resource_version = $2 LIMIT 1',
        [resourceName, resourceVersion]
      );
  
      if (result.rows.length > 0) {
        return res.json({ exists: true });
      } else {
        return res.json({ exists: false });
      }
    } catch (err) {
      console.error("Error checking resource version:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/delete-documentation", async (req,res)=>{
    const token = req.headers.authorization?.split(' ')[1];
    const {resourceName,resourceVersion} = req.body;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {

      const documentationResult = await pool.query(
          "SELECT resource_name,resource_version FROM documentation WHERE resource_name = $1 AND resource_version = $2",
          [resourceName,resourceVersion]
      );

      const documentation = documentationResult.rows[0];
      if (!documentation) return res.status(404).json({ message: "User not found" });

      await pool.query("DELETE FROM documentation WHERE resource_name = $1 AND resource_version = $2",[resourceName,resourceVersion]);

      res.status(200).json({ message: "Document has been deleted successfully" });

  } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Server error" });
  }

  });

  app.put("/edit-documentation", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { resourceContent, resourceName, resourceVersion } = req.body;
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
  
      // Check if the documentation exists
      const documentationResult = await pool.query(
        "SELECT resource_name, resource_version FROM documentation WHERE resource_name = $1 AND resource_version = $2",
        [resourceName, resourceVersion]
      );
  
      if (documentationResult.rowCount === 0) {
        return res.status(404).json({ message: "Documentation not found" });
      }
  
      // Update the content
      await pool.query(
        "UPDATE documentation SET resource_content = $1 WHERE resource_name = $2 AND resource_version = $3",
        [resourceContent, resourceName, resourceVersion]
      );
  
      res.status(200).json({ message: "Document has been edited successfully" });
    } catch (err) {
      console.error("Edit error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

app.get('/tag-filter', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { resourceName, resourceVersion } = req.query;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  try {
    const docResult = await pool.query(`
      SELECT id FROM documentation WHERE resource_name = $1 AND resource_version = $2`, [resourceName, resourceVersion]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const documentationId = docResult.rows[0].id;
    const tagsResult = await pool.query(`SELECT resource_tag_name FROM tag WHERE documentation_id = $1`, [documentationId]);

    res.json(tagsResult.rows);
  } catch (err) {
    console.error('Error searching tags:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/tag', authenticateToken, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { selectedResources, selectedVersion, newTags } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const resource_author = req.user.userId
    const docResult = await pool.query(`
      SELECT id FROM documentation WHERE resource_name = $1 AND resource_version = $2`,
      [selectedResources, selectedVersion]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const documentationId = docResult.rows[0].id;
    await pool.query(`
      INSERT INTO tag (documentation_id, resource_tag_name, resource_tag_author)
      VALUES ($1, $2, $3)`,
      [documentationId, newTags, resource_author]);

    res.status(201).json({ message: "Tags created successfully" });
  } catch (err) {
    console.error('Error Creating tags:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/delete-tag', authenticateToken, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { selectedResources, selectedVersion, tagsToDelete } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(tagsToDelete) || tagsToDelete.length === 0) {
    return res.status(400).json({ message: "No tags provided for deletion" });
  }

  try {
    const resource_author = req.user.userId;

    const docResult = await pool.query(`
      SELECT id FROM documentation WHERE resource_name = $1 AND resource_version = $2`,
      [selectedResources, selectedVersion]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const documentationId = docResult.rows[0].id;

    await pool.query(`
      DELETE FROM tag
      WHERE documentation_id = $1
      AND resource_tag_name = ANY($2::text[])
      AND resource_tag_author = $3`,
      [documentationId, tagsToDelete, resource_author]
    );

    res.status(200).json({ message: "Tags deleted successfully" });
  } catch (err) {
    console.error("Error deleting tags:", err);
    res.status(500).json({ message: "Server error",err });
  }
});

app.put('/edit-tag', authenticateToken, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { selectedResources, selectedVersion, tagsToEdit } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(tagsToEdit) || tagsToEdit.length === 0) {
    return res.status(400).json({ message: "No tags provided for editing" });
  }

  try {
    const resource_author = req.user.userId;

    const docResult = await pool.query(`
      SELECT id FROM documentation 
      WHERE resource_name = $1 AND resource_version = $2`,
      [selectedResources, selectedVersion]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const documentationId = docResult.rows[0].id;

    // Update each tag one by one
    for (const tag of tagsToEdit) {
      const { oldName, newName } = tag;

      await pool.query(`
        UPDATE tag
        SET resource_tag_name = $1,
            resource_tag_author = $2
        WHERE documentation_id = $3
          AND resource_tag_name = $4`,
        [newName, resource_author, documentationId, oldName]
      );
    }

    res.status(200).json({ message: "Tags updated successfully" });
  } catch (err) {
    console.error("Error updating tags:", err);
    res.status(500).json({ message: "Server error", err });
  }
});

app.get('/post', authenticateToken, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const userId = req.user.userId;


  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const postsResult = await pool.query(`
      SELECT 
        post.*, 
        tag.resource_tag_name, 
        devusers.username AS author_username, 
        documentation.resource_name AS resource_title,
        documentation.resource_version AS resource_version,
        color.resource_color,

        -- 💡 Count total likes/bookmarks per post
        COUNT(DISTINCT post_like.like_id) AS post_like_count,
        COUNT(DISTINCT post_bookmark.bookmark_id) AS post_bookmark_count,

        -- 💡 Check if current user liked/bookmarked the post
        COUNT(DISTINCT user_likes.like_id) > 0 AS is_liked,
        COUNT(DISTINCT user_bookmarks.bookmark_id) > 0 AS is_bookmarked,

        -- 💡 Count total comments per post
        (
          SELECT COUNT(*) FROM post_comment WHERE post_comment.post_id = post.post_id
        ) AS post_comment

      FROM post

      -- JOIN meta tables
      JOIN tag ON post.post_tag = tag.tag_id
      JOIN devusers ON post.post_author = devusers.id
      JOIN documentation ON post.post_resource = documentation.id
      LEFT JOIN color ON documentation.resource_name = color.resource_name

      -- JOIN post_like and post_bookmark for total counts
      LEFT JOIN post_like ON post.post_id = post_like.post_id
      LEFT JOIN post_bookmark ON post.post_id = post_bookmark.post_id

      -- JOIN again (aliased) to check if current user has liked/bookmarked
      LEFT JOIN post_like AS user_likes 
        ON post.post_id = user_likes.post_id AND user_likes.user_id = $1

      LEFT JOIN post_bookmark AS user_bookmarks 
        ON post.post_id = user_bookmarks.post_id AND user_bookmarks.user_id = $1

      GROUP BY 
        post.post_id, 
        tag.resource_tag_name, 
        devusers.username, 
        documentation.resource_name, 
        documentation.resource_version, 
        color.resource_color

      ORDER BY post.post_created_at DESC;

    `,[userId]);

    res.json(postsResult.rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});

app.get('/get-user-posts', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT 
        post.*, 
        tag.resource_tag_name, 
        devusers.username AS author_username, 
        documentation.resource_name AS resource_title,
        documentation.resource_version AS resource_version,
        color.resource_color,

        COUNT(DISTINCT post_like.like_id) AS post_like_count,
        COUNT(DISTINCT post_bookmark.bookmark_id) AS post_bookmark_count,

        COUNT(DISTINCT user_likes.like_id) > 0 AS is_liked,
        COUNT(DISTINCT user_bookmarks.bookmark_id) > 0 AS is_bookmarked,

        (
          SELECT COUNT(*) FROM post_comment WHERE post_comment.post_id = post.post_id
        ) AS post_comment

      FROM post
      JOIN tag ON post.post_tag = tag.tag_id
      JOIN devusers ON post.post_author = devusers.id
      JOIN documentation ON post.post_resource = documentation.id
      LEFT JOIN color ON documentation.resource_name = color.resource_name

      LEFT JOIN post_like ON post.post_id = post_like.post_id
      LEFT JOIN post_bookmark ON post.post_id = post_bookmark.post_id

      LEFT JOIN post_like AS user_likes 
        ON post.post_id = user_likes.post_id AND user_likes.user_id = $1

      LEFT JOIN post_bookmark AS user_bookmarks 
        ON post.post_id = user_bookmarks.post_id AND user_bookmarks.user_id = $1

      WHERE post.post_author = $1

      GROUP BY 
        post.post_id, 
        tag.resource_tag_name, 
        devusers.username, 
        documentation.resource_name, 
        documentation.resource_version, 
        color.resource_color

      ORDER BY post.post_created_at DESC;
    `, [userId]);

    res.status(200).json({ posts: result.rows });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Server error fetching user posts' });
  }
});

app.get('/get-user-posts/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        post.*, 
        devusers.username AS author_username,
        tag.resource_tag_name,
        documentation.resource_name AS resource_title,
        documentation.resource_version,
        color.resource_color

      FROM post
      JOIN devusers ON post.post_author = devusers.id
      JOIN tag ON post.post_tag = tag.tag_id
      JOIN documentation ON post.post_resource = documentation.id
      LEFT JOIN color ON documentation.resource_name = color.resource_name

      WHERE post.post_author = $1
      ORDER BY post.post_created_at DESC
    `, [userId]);

    const usernameResult = await pool.query(
      'SELECT username FROM devusers WHERE id = $1', [userId]
    );

    res.json({
      username: usernameResult.rows[0]?.username || 'Unknown',
      posts: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});



app.get('/post/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;

  try {
    // Fetch post and metadata
    const result = await pool.query(
      `
      SELECT 
        post.*, 
        tag.resource_tag_name, 
        devusers.username AS author_username, 
        documentation.resource_name AS resource_title,
        documentation.resource_version AS resource_version,
        color.resource_color,
        EXISTS (
          SELECT 1 FROM post_like WHERE post_like.post_id = post.post_id AND post_like.user_id = $2
        ) AS is_liked,
        EXISTS (
          SELECT 1 FROM post_bookmark WHERE post_bookmark.post_id = post.post_id AND post_bookmark.user_id = $2
        ) AS is_bookmarked,
        (
          SELECT COUNT(*) FROM post_like WHERE post_like.post_id = post.post_id
        ) AS post_like_count,
        (
          SELECT COUNT(*) FROM post_bookmark WHERE post_bookmark.post_id = post.post_id
        ) AS post_bookmark_count
      FROM post
      JOIN tag ON post.post_tag = tag.tag_id
      JOIN devusers ON post.post_author = devusers.id
      JOIN documentation ON post.post_resource = documentation.id
      LEFT JOIN color ON documentation.resource_name = color.resource_name
      WHERE post.post_id = $1
      `,
      [postId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postData = result.rows[0];

    // ✅ Fetch comments
    const commentResult = await pool.query(
      `
      SELECT 
        pc.comment_id, 
        pc.user_comment, 
        pc.created_at,
        u.username
      FROM post_comment pc
      JOIN devusers u ON pc.user_id = u.id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at DESC
      `,
      [postId]
    );

    // Attach comments to the post data
    postData.comments = commentResult.rows;

    res.json(postData);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



app.use('/uploads', express.static('uploads'));


app.post('/create-post', authenticateToken, upload.single('resource_graphic'), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const {
    resourceType,
    selectedResources,
    selectedVersion,
    selectedTag,
    resource_title,
    resource_content,
  } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const resource_author = req.user.userId;

    // Get related documentation ID
    const docResult = await pool.query(
      `SELECT id FROM documentation WHERE resource_name = $1 AND resource_version = $2`,
      [selectedResources, selectedVersion]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documentation not found' });
    }
    const documentationId = docResult.rows[0].id;

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const tagResult = await pool.query(
      `SELECT tag_id FROM tag WHERE documentation_id = $1 AND resource_tag_name = $2`,
      [documentationId, selectedTag?.resource_tag_name || selectedTag]
    );

    if (tagResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tag is not found' });
    }

    const tagId = tagResult.rows[0].tag_id;

    // Insert new post
    const result = await pool.query(
      `INSERT INTO post (
        post_type,post_tag, post_title, post_content, post_author,
        post_created_at, post_graphic, post_resource
      ) VALUES ($1, $2, $3, $4,$5, NOW(), $6,$7) RETURNING post_id`,
      [
        resourceType,
        tagId,
        resource_title,
        resource_content,
        resource_author,
        req.file ? req.file.filename : null, // optionally: `/uploads/${req.file.filename}`
        documentationId
      ]
    );

    res.status(201).json({
      message: "Post created successfully",
      postId: result.rows[0].id
    });

  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /post/:id
app.delete('/post/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;

  const result = await pool.query(
    'DELETE FROM post WHERE post_id = $1 AND post_author = $2 RETURNING *',
    [postId, userId]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({ message: 'Not authorised to delete this post' });
  }

  res.json({ message: 'Post deleted successfully' });
});


// Post Extra Functionality //

app.post('/post/:postId/like', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;

  try {
    const existing = await pool.query(
      `SELECT * FROM post_like WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await pool.query(
        `DELETE FROM post_like WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );
      return res.json({ liked: false });
    } else {
      // Like
      await pool.query(
        `INSERT INTO post_like (post_id, user_id) VALUES ($1, $2)`,
        [postId, userId]
      );
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/post/:postId/bookmark', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;

  try {
    const existing = await pool.query(
      `SELECT * FROM post_bookmark WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM post_bookmark WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );
      return res.json({ bookmarked: false });
    } else {
      await pool.query(
        `INSERT INTO post_bookmark (post_id, user_id) VALUES ($1, $2)`,
        [postId, userId]
      );
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    console.error("Bookmark Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/post/:postId/comment', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const { comment } = req.body;

  if (!comment?.trim()) {
    return res.status(400).json({ message: "Empty comment not allowed" });
  }

  try {
    await pool.query(
      `INSERT INTO post_comment (post_id, user_id, user_comment, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [postId, userId, comment]
    );
    res.status(201).json({ message: "Comment added" });
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/post/:postId/comments', async (req, res) => {
  const postId = req.params.postId;

  try {
    const result = await pool.query(
      `SELECT c.comment_id, c.user_comment, c.created_at, u.username
       FROM post_comment c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.post_id = $1
       ORDER BY c.comment_created_at ASC`,
      [postId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Comments Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/search', authenticateToken, async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Missing search query" });
  }

  const q = `%${query.toLowerCase()}%`;

  try {
    const result = await pool.query(`
      SELECT 
        post.post_id,
        post.post_title,
        post.post_content,
        post.post_graphic,
        post.post_author,
        tag.resource_tag_name,
        documentation.resource_name,
        documentation.resource_version,
        color.resource_color,
        devusers.username AS author_username,
        post.post_type,

        -- Interaction counts
        (SELECT COUNT(*) FROM post_like WHERE post_like.post_id = post.post_id) AS post_like_count,
        (SELECT COUNT(*) FROM post_bookmark WHERE post_bookmark.post_id = post.post_id) AS post_bookmark_count,
        (SELECT COUNT(*) FROM post_comment WHERE post_comment.post_id = post.post_id) AS post_comment,

        -- Current user interactions
        EXISTS (
          SELECT 1 FROM post_like WHERE post_like.post_id = post.post_id AND post_like.user_id = $2
        ) AS is_liked,
        EXISTS (
          SELECT 1 FROM post_bookmark WHERE post_bookmark.post_id = post.post_id AND post_bookmark.user_id = $2
        ) AS is_bookmarked

      FROM post
      JOIN devusers ON post.post_author = devusers.id
      JOIN documentation ON post.post_resource = documentation.id
      JOIN tag ON post.post_tag = tag.tag_id
      LEFT JOIN color ON documentation.resource_name = color.resource_name
      WHERE 
        LOWER(post.post_title) LIKE $1 OR 
        LOWER(devusers.username) LIKE $1 OR 
        LOWER(tag.resource_tag_name) LIKE $1 OR
        LOWER(documentation.resource_name) LIKE $1
      ORDER BY post.post_created_at DESC
    `, [q, req.user.userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error during search" });
  }
});









  

