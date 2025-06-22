import { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Autocomplete,
  Snackbar,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import { usePostContext } from "../data/contextData";
import { resourceName, resourceType } from "../data/generalData";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import MarkdownEditor from "./MarkdownEditor";


export default function CreateContentButton() {

  const [isModerator,setIsModerator] = useState(true)
  const [thirdModal,setThirdModal] = useState(false)
  const [secondModal,setSecondModal] = useState(false)
  const [firstModal,setFirstModal] = useState(false)

  const [resourceNameOptions, setResourceNameOptions] = useState([]);
  const [resourceVersionOptions, setResourceVersionOptions] = useState([]);

  const [selectedResourceType,setResourceType] = useState(null);
  const [selectedResourceName,setResourceName] = useState(null);
  const [selectedResourceVersion,setResourceVersion] = useState(null);
  const [selectedResourceTag,setResourceTag] = useState(null);
  const [contentType,setContentType] = useState("Unofficial")
  const [newResourceTitle,setNewResourceTitle] = useState(null);
  const [newResourceDesc,setNewResourceDesc] = useState(null);
  const [newResourceContent,setNewResourceContent] = useState(null);
  const [newResourceImg,setNewResourceImg] = useState(null);
  const [tags, setTags] = useState([]);


  const [open, setOpen] = useState(false);

  
  const [formData, setFormData] = useState({
    resourceType: selectedResourceType,
    selectedResources: selectedResourceName,
    selectedVersion: selectedResourceVersion,
    newResourceTitle: "",
    newResourceContent: "",
    imageName: "",
    imagePreview: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [mediaInputType, setMediaInputType] = useState("upload");
  const [mediaUrl, setMediaUrl] = useState("");

    useEffect(() => {
      if (selectedResourceType) {
        setResourceName(null);
        setResourceVersion(null);
        axios.get("https://devcenter-kofh.onrender.com/documentation/names", {
          params: { resourceType: selectedResourceType }
        })
        .then(res => setResourceNameOptions(res.data))
        .catch(err => console.error("Failed to fetch names:", err));
      }
    }, [selectedResourceType]);  
    useEffect(() => {
      if (selectedResourceType && selectedResourceName) {
        setResourceVersion(null);
        axios.get("https://devcenter-kofh.onrender.com/documentation/versions", {
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
      axios.get("https://devcenter-kofh.onrender.com/tag-filter", {
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

  const fileInputRef = useRef(null);
  const createButtonRef = useRef(null);

  const { dispatch } = usePostContext();

  const handleClose = () => {
    setOpen(false);
    setFormData({
      resourceType: selectedResourceType,
      selectedResources: selectedResourceName,
      selectedVersion: selectedResourceVersion,
      newResourceTitle: "",
      newResourceContent: "",
      newResourceDesc:"",
      imageName: "",
      imagePreview: "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewResourceImg(file)
      setFormData((prev) => ({
        ...prev,
        imageName: file.name,
        imageFile: file, 
      }));
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleDragDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange({ target: { files: [file] } });
  };

const { token } = useContext(UserContext);
const handlePost = async () => {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append("resourceType", contentType);
    formDataToSend.append("selectedResources", selectedResourceName);
    formDataToSend.append("selectedVersion", selectedResourceVersion);
    formDataToSend.append("selectedTag", selectedResourceTag?.resource_tag_name || selectedResourceTag);
    formDataToSend.append("resource_title", newResourceTitle);
    formDataToSend.append("resource_content", newResourceContent);
    formDataToSend.append("resource_desc",newResourceDesc)

    if (mediaInputType === "upload" && newResourceImg) {
      formDataToSend.append("resource_graphic", newResourceImg);
    } else if (mediaInputType === "url" && mediaUrl) {
      formDataToSend.append("resource_graphic_url", mediaUrl);
    }

    const response = await axios.post("https://devcenter-kofh.onrender.com/create-post", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 201) {
      dispatch({ type: "ADD_POST", payload: response.data });
      setSnackbarOpen(true);
      handleClose();
      createButtonRef.current?.focus();
      window.location.reload();

    }
  } catch (err) {
    if (err.response) {
      alert(`Error: ${err.response.data.message}`);
    } else {
      console.error("Error submitting documentation:", err);
    }
  }
};

  return (
    <>
      {/* ✅ SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: "#1b5e20",
            color: "#ffffff",
            borderRadius: 1,
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          },
        }}
        message="Post created successfully!"
        action={
          <Button
            variant="outlined"
            sx={{
              color: "#ffffff",
              borderColor: "#a5d6a7",
              "&:hover": { borderColor: "#81c784" },
            }}
            size="small"
            onClick={() => setSnackbarOpen(false)}
          >
            View
          </Button>
        }
      />

      {/* ✅ MAIN BUTTON */}
      <Button
        ref={createButtonRef}
        sx={{ backgroundColor: "white", color: "black" }}
        aria-label="Create a new post"
        onClick={() => setFirstModal(true)}
      >
        Create Post
      </Button>

      {isModerator && (
        <Modal open={firstModal} onClose={() => setFirstModal(false)}>
          <Box
            sx={{
              bgcolor: "#2c2c2c",
              color: "white",
              borderRadius: 2,
              p: 4,
              width: "400px",
              mx: "auto",
              mt: "20vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6"> Select Resource Type</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() =>{ setFirstModal(false);setSecondModal(true);setContentType("Official")}}>Main Content</Button>
              <Button variant="contained" onClick={() =>{ setFirstModal(false);setSecondModal(true);setContentType("Unofficial")}}>Secondary Content</Button>
            </Box>
          </Box>
        </Modal>
      )}

<Modal open={secondModal} onClose={() => setSecondModal(false)}>
  <Box
    sx={{
      bgcolor: "#2c2c2c",
      color: "white",
      borderRadius: 2,
      p: 4,
      width: "700px", // Increased width
      mx: "auto",
      mt: "20vh",
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}
  >
    <Typography variant="h6" align="center">Select Resource References</Typography>

    {/* Resource Type Dropdown */}
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
        bgcolor: "#393636",
        "& .MuiInputBase-input": { color: "white" },
        "& .MuiInputLabel-root": { color: "whitesmoke" },
        "& .MuiInputLabel-root.Mui-focused": { color: "white" },
      }}
    />

    {/* Resource Name + Version in a single row */}
    <Box sx={{ display: "flex", gap: 2 }}>
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
          />
        )}
        sx={{
          flex: 1,
          bgcolor: "#393636",
          borderRadius: "5px",
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "whitesmoke" },
          "& .MuiInputLabel-root.Mui-focused": { color: "white" },
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
          />
        )}
        sx={{
          flex: 1,
          bgcolor: selectedResourceName ? "#393636" : "#2e2e2e",
          borderRadius: "5px",
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "whitesmoke" },
          "& .MuiInputLabel-root.Mui-focused": { color: "white" },
        }}
      />
    </Box>
      <Autocomplete
        options={tags}
        getOptionLabel={(option) => option.resource_tag_name || ""} 
        value={selectedResourceTag}
        onChange={(event, newValue) => {
          setResourceTag(newValue);
          console.log("Selected Tag:", newValue);
        }}
        disabled={!selectedResourceVersion}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            variant="outlined"
          />
        )}
        sx={{
          flex: 1,
          bgcolor: selectedResourceName ? "#393636" : "#2e2e2e",
          borderRadius: "5px",
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "whitesmoke" },
          "& .MuiInputLabel-root.Mui-focused": { color: "white" },
        }}
      />
    {/* Navigation Buttons */}
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
      <Button variant="contained" onClick={() => { setFirstModal(true); setSecondModal(false); }}>
        Back
      </Button>
      <Button
        disabled = {!selectedResourceName || !selectedResourceType|| !selectedResourceVersion}
        variant="contained" 
        onClick={() => { setSecondModal(false); setThirdModal(true); }}>
        Continue
      </Button>
    </Box>
  </Box>
</Modal>

<Modal open={thirdModal} onClose={() => setThirdModal(false)}>
    <Box
      sx={{
        bgcolor: "#2c2c2c",
        color: "white",
        borderRadius: 2,
        p: 4,
        width: "700px",
        maxHeight: "90vh", // Ensure it doesn't exceed viewport
        overflowY: "auto", // Enable vertical scroll
        mx: "auto",
        mt: "5vh", // Reduce to give more scroll space
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
    <Typography variant="h6" align="center" sx={{ mb: 1 }}>
      Finalize Documentation
    </Typography>

<Box>
  <Tabs
    value={mediaInputType}
    onChange={(e, newValue) => setMediaInputType(newValue)}
    centered
    textColor="inherit"
    TabIndicatorProps={{ style: { display: "none" } }}
    sx={{
      mt:1,
      mb:2,
      borderRadius: "8px",
      display: "flex",
      justifyContent: "center",
      '& .MuiTab-root': {
        color: "white",
        mx: 1,
        borderRadius: "6px",
        textTransform: "none",
        minWidth: "120px",
        transition: "0.3s",
      },
      '& .Mui-selected': {
        bgcolor: "#2196f3", // selected tab color
        fontWeight: "bold",
      },
    }}
  >
    <Tab label="Upload Media (Direct)" value="upload" />
    <Tab label="Upload Media (URL)" value="url" />
  </Tabs>

  {/* Upload File Input */}
  {mediaInputType === "upload" && (
    <Box
      onDrop={handleDragDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        border: "2px dashed #ccc",
        borderRadius: 2,
        p: 2,
        textAlign: "center",
        cursor: "pointer",
        color: "#ccc",
        bgcolor: "#1e1e1e"
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <Typography>Click or drag & drop to upload an image</Typography>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />
      {formData.imagePreview && (
        <Box mt={2}>
          <img
            src={formData.imagePreview}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 8 }}
          />
        </Box>
      )}
    </Box>
  )}

  {/* URL Input */}
  {mediaInputType === "url" && (
    <TextField
      fullWidth
      variant="filled"
      label="Enter Media URL"
      value={mediaUrl}
      onChange={(e) => setMediaUrl(e.target.value)}
      sx={{
        bgcolor: "#393636",
        mt: 1,
        input: { color: "white" },
        label: { color: "whitesmoke" },
        "& .MuiInputLabel-root.Mui-focused": { color: "white" },
      }}
    />
  )}
</Box>


    <TextField
      fullWidth
      label="Content Title"
      value={newResourceTitle}
      onChange={(e) => setNewResourceTitle(e.target.value)}
      disabled={!selectedResourceVersion}
      variant="filled"
      sx={{
        backgroundColor: selectedResourceVersion ? "#393636" : "#2e2e2e",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "white" },
        "& .MuiInputLabel-root": { color: "whitesmoke" },
      }}
    />
    <TextField
      fullWidth
      label="Content Description"
      multiline
      minRows={5}
      value={newResourceDesc}
      onChange={(e) => setNewResourceDesc(e.target.value)}
      disabled={!selectedResourceVersion}
      variant="filled"
      sx={{
        backgroundColor: selectedResourceVersion ? "#393636" : "#2e2e2e",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "white" },
        "& .MuiInputLabel-root": { color: "whitesmoke" },
      }}
    />
    <MarkdownEditor value={newResourceContent} onChange={(val) => setNewResourceContent(val)} />
    {/* Post Button */}
    <Button
      variant="contained"
      fullWidth
      disabled={!newResourceContent}
      onClick={handlePost}
      sx={{
        bgcolor: "#1976d2",
        "&:hover": { bgcolor: "#1565c0" },
      }}
    >
      Create Documentation
    </Button>
  </Box>
</Modal>

    </>
  );
}
