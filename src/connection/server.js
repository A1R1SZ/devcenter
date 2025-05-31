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
            { expiresIn: "1h" }
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
            "SELECT username, email FROM devUsers WHERE id = $1",
            [userId]
        );

        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ username: user.username, email: user.email });
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
      // New Resource: resource_name must be unique
      // OK to insert
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
        color.resource_color
      FROM post
      JOIN tag ON post.post_tag = tag.tag_id
      JOIN devusers ON post.post_author = devusers.id
      JOIN documentation ON post.post_resource = documentation.id
      LEFT JOIN color ON documentation.resource_name = color.resource_name
      ORDER BY post.post_created_at DESC
    `);

    res.json(postsResult.rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Server error', err });
  }
});









  

