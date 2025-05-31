import React, { useContext, useEffect, useState } from "react";
import TopNavbar from "../components/topNavbar";
import { Box, Card, Typography, Autocomplete, TextField, Button, Stack, Modal, TextareaAutosize, Chip } from "@mui/material";
import { languageColors } from "../data/languageData";
import { resourceName, resourceType, resourceVersion } from "../data/generalData";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

export default function TagsPage() {
  const [selectedResourceType, setResourceType] = useState(null);
  const [selectedResourceName, setResourceName] = useState(null);
  const [selectedResourceVersion, setResourceVersion] = useState(null);

  const [resourceNameOptions, setResourceNameOptions] = useState([]);
  const [resourceVersionOptions, setResourceVersionOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const { token } = useContext(UserContext);

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
    }
  }, [selectedResourceName]);

  useEffect(() => {
    if (selectedResourceName && selectedResourceVersion) {
      axios.get("http://localhost:5000/tag-filter", {
        params: {
          resourceName: selectedResourceName,
          resourceVersion: selectedResourceVersion,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setTags(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch tags:", err);
      });
    }
  }, [selectedResourceName, selectedResourceVersion]);

  const [isHidden, setIsHidden] = useState(false);                 

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [content, setContent] = useState(tags);
  const [editedContent, setEditedContent] = useState(content);

  const handleDeleteTags = async () => {
    if (selectedTags.length === 0) return;

    try {
      const response = await axios.delete("http://localhost:5000/delete-tag", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        data: {
          selectedResources: selectedResourceName,
          selectedVersion: selectedResourceVersion,
          tagsToDelete: selectedTags
        }
      });

      console.log("Deleted:", response.data);
      
      // Refresh tag list
      setTags(prevTags => prevTags.filter(tag => !selectedTags.includes(tag.resource_tag_name)));
      setSelectedTags([]);
      setOpenDeleteModal(false);

    } catch (err) {
      console.error("Failed to delete tags:", err);
    }
  };

  const handleEditTag = async () => {
    if (selectedTags.length !== 1 || !editedContent.trim()) return;

    const oldName = selectedTags[0];
    const newName = editedContent.trim();

    try {
      const response = await axios.put("http://localhost:5000/edit-tag", {
        selectedResources: selectedResourceName,
        selectedVersion: selectedResourceVersion,
        tagsToEdit: [{ oldName, newName }]
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Tag updated:", response.data);

      // Update UI
      setTags(prev =>
        prev.map(tag =>
          tag.resource_tag_name === oldName
            ? { ...tag, resource_tag_name: newName }
            : tag
        )
      );
      setSelectedTags([newName]);
      setContent(newName);
      setEditedContent(newName);
      setOpenEditModal(false);
    } catch (err) {
      console.error("Failed to update tag:", err);
    }
  };


  const modalStyle = {
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
        TAGS
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", width: "80%", marginLeft: "20%", paddingTop: "20px", backgroundColor: "#181818", minHeight: '90vh' }}>
        <Box sx={{ width: "95%" }}>
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
                console.log("Selected Name:", newValue);
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
              sx={{ backgroundColor: "#393636", flex: 1 }}
            />
            <Autocomplete
              options={resourceVersionOptions || []}
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
              sx={{ backgroundColor: "#393636", flex: 1 }}
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
                    color: selectedResourceName && languageColors[selectedResourceName] ? languageColors[selectedResourceName] : "white",
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
                  variant="outlined"
                  size="small"
                  sx={{
                    color: selectedTags.length === 1 ? "white" : "gray",
                    borderColor: selectedTags.length === 1 ? "#64b5f6" : "#555",
                    "&:hover": { borderColor: selectedTags.length === 1 ? "#42a5f5" : "#555" }
                  }}
                  disabled={selectedTags.length !== 1}
                  onClick={() => {
                    if (selectedTags.length === 1) {
                      const currentTag = selectedTags[0];
                      setEditedContent(currentTag);
                      setContent(currentTag);
                      setOpenEditModal(true);
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ color: "white", borderColor: "#ef5350", "&:hover": { borderColor: "#e53935" } }}
                  onClick={() => setOpenDeleteModal(true)}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsHidden(!isHidden)}
                  sx={{ color: "white", borderColor: "#ffa726", "&:hover": { borderColor: "#fb8c00" } }}
                >
                  {isHidden ? "Show" : "Hide"}
                </Button>
              </Stack>
              )}
            </Box>

            {!isHidden && (
              <Card sx={{ backgroundColor: '#2A2828', color: 'white', padding: '20px', marginTop: '20px' }}>
                {tags.map((tag, index) => {
                  const isSelected = selectedTags.includes(tag.resource_tag_name);
                  return (
                    <Chip
                      key={index}
                      label={tag.resource_tag_name}
                      onClick={() => {
                        const newSelectedTags = isSelected
                          ? selectedTags.filter(t => t !== tag.resource_tag_name)
                          : [...selectedTags, tag.resource_tag_name];
                        
                        console.log("Selected Tags:", newSelectedTags); // ✅ Debugging log
                        setSelectedTags(newSelectedTags);
                      }}
                      sx={{
                        mr: 1,
                        mb: 1,
                        backgroundColor: isSelected ? "#1e88e5" : "#64b5f6",
                        color: "white",
                        cursor: "pointer",
                        border: isSelected ? "2px solid white" : "none"
                      }}
                    />
                  );
                })}
              </Card>

            )}
          </Card>
        </Box>
      </Box>

      {/* Edit Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ marginBottom: '10px' }}>Edit Content</Typography>
          <TextareaAutosize
            minRows={5}
            style={{ width: '100%', padding: '10px', background: '#2e2e2e', color: 'white', border: '1px solid #555' }}
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
              onClick={handleEditTag}
              sx={{ backgroundColor: "#64b5f6" }}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <Box sx={modalStyle}>
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
              onClick={handleDeleteTags}
              sx={{ backgroundColor: "#ef5350" }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
