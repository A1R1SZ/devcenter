import React, { useContext, useEffect, useState } from "react";
import TopNavbar from "../components/topNavbar";
import { Box, Card, Typography, Autocomplete, TextField, Button, Stack, Modal } from "@mui/material";
import { resourceType } from "../data/generalData";
import axios from "axios";
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { UserContext } from "../contexts/UserContext";
import 'highlight.js/styles/github.css';
import remarkBreaks from 'remark-breaks';


function DocumentationPage() {
  const [selectedResourceType,setResourceType] = useState(null);
  const [selectedResourceName,setResourceName] = useState(null)
  const [selectedResourceVersion,setResourceVersion] = useState(null);

  const [resourceNameOptions, setResourceNameOptions] = useState([]);
  const [resourceVersionOptions, setResourceVersionOptions] = useState([]);
  const [resourceColor,setResourceColor] = useState(null);
  
  
  const [documentationData, setDocumentationData] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  

  const { token } = useContext(UserContext);

  const handleDelete = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/delete-documentation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          resourceName: selectedResourceName,
          resourceVersion: selectedResourceVersion
        }
      });
  
      if (response.status === 200) {
        alert("Documentation deleted successfully!");
        setOpenDeleteModal(false);
        setDocumentationData([]);
        setResourceVersion(null);
        window.location.reload();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete documentation.");
    }
  };
  
  const handleSave = async () => {
    try {
      const response = await axios.put("http://localhost:5000/edit-documentation", {
        resourceContent: editedContent,
        resourceName: selectedResourceName,
        resourceVersion: selectedResourceVersion,

      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        alert("Content saved successfully!");
        setOpenEditModal(false);
        // Optionally refresh documentation data
        setDocumentationData((prev) => prev.map(doc => ({
          ...doc,
          resource_content: editedContent
        })));
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content.");
    }
  };

  const handleFollow = async () => {
    try {
      const res = await axios.post('http://localhost:5000/follow-resource', {
        selectedResources: selectedResourceName,
        selectedVersion: selectedResourceVersion
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsFollowing(res.data.followed); // toggle UI state
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      alert("Something went wrong while toggling follow.");
    }
  };

  const checkFollowStatus = async () => {
    if (!selectedResourceName || !selectedResourceVersion) return;

    try {
      const res = await axios.get('http://localhost:5000/check-follow-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          resourceName: selectedResourceName,
          resourceVersion: selectedResourceVersion
        }
      });

      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Error checking follow status:", err);
      setIsFollowing(false);
    }
  };

  useEffect(() => {
    if (selectedResourceType && selectedResourceName && selectedResourceVersion) {
      checkFollowStatus();
    }
  }, [selectedResourceType, selectedResourceName, selectedResourceVersion]);


  useEffect(() => {
    if (selectedResourceType) {
      setResourceName(null);
      setResourceVersion(null);
      axios.get("http://localhost:5000/documentation/names", {
        params: { resourceType: selectedResourceType }
      })
      .then(res => setResourceNameOptions(res.data))
      .catch(err => console.error("Failed to fetch names:", err));
    }
  }, [selectedResourceType]);

  useEffect(() => {
    if (selectedResourceType && selectedResourceName) {
      setResourceVersion(null);
      axios.get("http://localhost:5000/documentation/versions", {
        params: {
          resourceType: selectedResourceType,
          resourceName: selectedResourceName
        }
      })
      .then(res => setResourceVersionOptions(res.data))
      .catch(err => console.error("Failed to fetch versions:", err));

      axios.get("http://localhost:5000/color", {
        params: {
          resourceName: selectedResourceName
        }
      })
      .then(res => {
        console.log("Received color:", res.data.resource_color);
        if (res.data.length > 0) {
          setResourceColor(res.data[0].resource_color);
        } else {
          setResourceColor("white"); // fallback color
        }
      })
      .catch(err => console.error("Failed to fetch color:", err));
    }
  }, [selectedResourceName]);

  useEffect(() => {
    if (selectedResourceType && selectedResourceName && selectedResourceVersion) {
      axios.get("http://localhost:5000/documentation/filter", {
        params: {
          resourceType: selectedResourceType,
          resourceName: selectedResourceName,
          resourceVersion: selectedResourceVersion
        }
      })
      .then((res) => {
        console.log("Fetched data:", res.data); 
        setDocumentationData(res.data);

        // ✅ Extract the first resource's description
        if (res.data.length > 0) {
          setResourceDesc(res.data[0].resource_desc || "No description available.");
        } else {
          setResourceDesc("No description available.");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch documentation:", err);
      });
    }
  }, [selectedResourceType, selectedResourceName, selectedResourceVersion]);

  
  

  const [isHidden, setIsHidden] = useState(false);
  // Modal states
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [content, setContent] = useState("'Paste here'");
  const [resourceDesc, setResourceDesc] = useState("");
  const [editedContent, setEditedContent] = useState(content);

  // Modal styles
  const modalDeleteStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#393636",
    padding: "20px",
    borderRadius: "8px",
    color: "white",
    width: 400,
    boxShadow: 24,
  };

  const modalEditStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#393636",
    padding: "20px",
    borderRadius: "8px",
    color: "white",
    width: 400,
    height:500,
    boxShadow: 24,
  };

  return (
    <>
      <TopNavbar />
      <Typography
        sx={{
          position: "fixed",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "white",
          fontWeight: 600,
          fontSize: 30,
        }}
      >
        DOCUMENTATION
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", width: "80%", marginLeft: "20%", paddingTop: "20px", backgroundColor: "#181818", minHeight: '90vh' }}>
        <Box sx={{ width: "95%" }}>
          {/* Language and Version Selectors */}
          <Autocomplete
            options={resourceType}
            value={selectedResourceType}
            onChange={(e, value) => setResourceType(value)}
            renderInput={(params) => (
                <TextField
                {...params}
                label="Resource Type"
                variant="filled"
                />
            )}
            sx={{
                mb: 2,
                bgcolor: "#393636",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
            }}
            />
          <Box sx={{ display: "flex", gap: "10px", marginBottom: "10px", marginTop: '25px' }}>
            <Autocomplete
              options={resourceNameOptions}
              value={selectedResourceName}
              onChange={(event, newValue) => {
                setResourceName(newValue);
                console.log("Selected Name:",newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Resource Name"
                  variant="outlined"
                  sx={{
                    backgroundColor: "#393636",
                    borderRadius: "5px",
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "whitesmoke" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  }}
                />
              )}
              sx={{
                backgroundColor: "#393636",
                flex: 1,
              }}
            />

            <Autocomplete
              options={resourceVersionOptions}
              value={selectedResourceVersion}
              onChange={(event, newValue) => {
                console.log("Selected Version:", newValue);
                setResourceVersion(newValue);
              }}
              disabled={!selectedResourceName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Resource Version"
                  variant="outlined"
                  sx={{
                    backgroundColor: selectedResourceName ? "#393636" : "#2e2e2e",
                    borderRadius: "5px",
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "whitesmoke" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  }}
                />
              )}
              sx={{
                backgroundColor: "#393636",
                flex: 1,
              }}
            />

          </Box>

          <Card
            sx={{
              backgroundColor: "#393636",
              padding: "25px",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
              height: "1000px",
              color: "white",
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  sx={{
                    fontSize: 50,
                    fontWeight: 600,
                    color: resourceColor,
                    textTransform: "uppercase",
                  }}
                >
                  {selectedResourceName || "Select Resources"}
                </Typography>

                {selectedResourceVersion && (
                  <Typography
                    sx={{
                      fontSize: 30,
                      fontWeight: 500,
                      color: "whitesmoke",
                      marginTop: "20px",
                      marginLeft: '10px',
                    }}
                  >
                    Version: {selectedResourceVersion}
                  </Typography>
                )}
              </Box>

              {selectedResourceName && selectedResourceVersion && (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleFollow}
                    sx={{
                      backgroundColor: isFollowing ? "#757575" : "#81c784",
                      "&:hover": {
                        backgroundColor: isFollowing ? "#616161" : "#66bb6a"
                      }
                    }}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ color: "white", borderColor: "#64b5f6", "&:hover": { backgroundColor: "#42a5f5" } }}
                    onClick={() => {
                      // Get the first documentation content (assuming one result per version)
                      const docContent = documentationData[0]?.resource_content || "";
                      setContent(docContent);
                      setEditedContent(docContent);
                      setOpenEditModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ color: "white", borderColor: "#ef5350", "&:hover": { backgroundColor: "#e53935" } }}
                    onClick={() => setOpenDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </Stack>
              )}
            </Box>

            {!isHidden && (
              <Card sx={{ backgroundColor: '#2A2828', color: 'white', padding: '20px', marginTop: '20px' }}>
                {resourceDesc && (
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: "#bbbbbb",
                      marginTop: "10px",
                      marginLeft: '10px',
                      maxWidth: "90%",
                      fontStyle: 'italic'
                    }}
                  >
                    {resourceDesc}
                  </Typography>
                )}
                {documentationData.map((doc) => (
                  <Card sx={{ backgroundColor: '#2A2828', color: 'white', padding: '20px', marginTop: '20px', overflowY: 'auto', maxHeight: '800px' }}>
                    <ReactMarkdown
                      children={documentationData[0]?.resource_content || "No documentation available."}
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeSanitize, rehypeHighlight]} 
                      components={{
                        h1: ({node, ...props}) => <Typography variant="h4" sx={{ color: 'white' }} gutterBottom {...props} />,
                        h2: ({node, ...props}) => <Typography variant="h5" sx={{ color: 'white' }} gutterBottom {...props} />,
                        p: ({node, ...props}) => <Typography sx={{ color: 'white' }} paragraph {...props} />,
                        code: ({node, inline, className, children, ...props}) =>
                          inline ? (
                            <code style={{ backgroundColor: '#444', padding: '2px 4px', borderRadius: '4px' }} {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre style={{ backgroundColor: '#333', padding: '10px', borderRadius: '5px', overflowX: 'auto' }} {...props}>
                              <code>{children}</code>
                            </pre>
                          )
                      }}
                    />
                  </Card>
                ))}
              </Card>
            )}
          </Card>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={modalEditStyle}>
          <Typography variant="h6" sx={{ marginBottom: '10px' }}>Edit {selectedResourceName} version {selectedResourceVersion}</Typography>
          <TextField
            multiline
            minRows={10}
            fullWidth
            variant="outlined"
            sx={{
              backgroundColor: "#2e2e2e",
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#64b5f6" },
                "& input": {
                  color: "white",
                },
                "& textarea": {
                  color: "white",
                },
              },
            }}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <Stack direction="row" spacing={1} sx={{ marginTop: '15px', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenEditModal(false)}
              sx={{ color: "white", borderColor: "#757575" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              sx={{ backgroundColor: "#64b5f6" }}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <Box sx={modalDeleteStyle}>
          <Typography variant="h6" sx={{ marginBottom: '10px' }}>Confirm Delete</Typography>
          <Typography sx={{ marginBottom: '20px' }}>Are you sure you want to delete the content?</Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenDeleteModal(false)}
              sx={{ color: "white", borderColor: "#757575" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}

export default DocumentationPage;
