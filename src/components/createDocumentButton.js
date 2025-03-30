import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Autocomplete,
  Stack,
  Snackbar,
  Typography,
} from "@mui/material";
import { usePostContext } from "../data/contextData";
import { resourceName, resourceType } from "../data/generalData";


export default function CreateDocumentationButton() {

  const [postType,setPostType] = useState(null);
  const [selectedResourceType,setResourceType] = useState(null);
  const [selectedResourceName,setResourceName] = useState(null);
  const [selectedResourceVersion,setResourceVersion] = useState(null);
  const [newResourceTitle,setNewResourceTitle] = useState(null);
  const [newResourceContent,setNewResourceContent] = useState(null);
  const [newResourceImg,setNewResourceImg] = useState(null);

  const resourceDataName =
  selectedResourceType === "Language"
  ? resourceName[0] || []
  : selectedResourceType === "Tools" || selectedResourceType === "Package"
  ? resourceName[1] || []
  : [];



  const [open, setOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [resouceExistance, setResourceExistance] = useState(null);

  
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
      imageName: "",
      imagePreview: "",
    });
    setResourceExistance(null);
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

  const handlePost = () => {
    const updatedFormData = {
      resourceType: selectedResourceType,
      selectedResources: selectedResourceName,
      selectedVersion: selectedResourceVersion,
      newDocumentTitle: newResourceTitle,
      newDocumentContent: newResourceContent,
      newDocumentImage: newResourceImg,
    };
  
    console.log("Final Form Data:", updatedFormData);
  
    dispatch({ type: "ADD_POST", payload: updatedFormData });
  
    handleClose();
    setSnackbarOpen(true);
    createButtonRef.current.focus();
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
        message="Documentation created successfully!"
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

      {/* ✅ STEP MODAL */}
      <Modal
        open={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <Box
          sx={{
            bgcolor: "#2c2c2c",
            color: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: "550px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" mb={2}>
            Create documentation for a new or existing resource type?
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                color: "#ffffff",
                borderColor: "#90caf9",
                "&:hover": { borderColor: "#64b5f6" },
              }}
              onClick={() => {
                setResourceExistance(false);
                setStepModalOpen(false);
                setOpen(true);
              }}
            >
              New Resource
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                color: "#ffffff",
                borderColor: "#90caf9",
                "&:hover": { borderColor: "#64b5f6" },
              }}
              onClick={() => {
                setResourceExistance(true);
                setStepModalOpen(false);
                setOpen(true);
              }}
            >
              Existing Resource
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* ✅ MAIN BUTTON */}
      <Button
        ref={createButtonRef}
        sx={{ backgroundColor: "white", color: "black" }}
        onClick={() => setStepModalOpen(true)}
        aria-label="Create a new post"
      >
        Create Documentation
      </Button>

      {/* ✅ DOCUMENTATION MODAL */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <Box
          sx={{
            bgcolor: "#2c2c2c",
            color: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            width: "1000px",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>
            Create Documentation{" "}
            {resouceExistance ? "(Existing Resource)" : "(New Resource)"}
          </h2>

          {/* RESOURCE TYPE */}
          <Autocomplete
          options={resourceType}
          value={selectedResourceType}
          onChange={(e, value) => {
            setResourceType(value);
            setResourceName(null);
            setResourceVersion(null)
            console.log("Selected Type",value)
          }}
          renderInput={(params) => (
              <TextField
              {...params}
              label="Resource Type"
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
              mb: 2,
              bgcolor: "#393636",
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "whitesmoke" },
              "& .MuiInputLabel-root.Mui-focused": { color: "white" },
          }}
          />

          {/* RESOURCE NAME */}
          {resouceExistance && (<Autocomplete
              options={resourceDataName}
              value={selectedResourceName}
              onChange={(event, newValue) => {
                setResourceName(newValue);
                setResourceVersion(null);
                console.log("Selected Name:",newValue);
              }}
              disabled={!selectedResourceType}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Resource Name"
                  variant="outlined"
                  sx={{
                    backgroundColor: selectedResourceType ? "#393636" : "#2e2e2e",
                    borderRadius: "5px",
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "whitesmoke" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  }}
                />
              )}
              sx={{
                mb: 2,
                backgroundColor: "#393636",
                flex: 1,
              }}
            />)}
          {!resouceExistance && (
            <TextField
            disabled={!selectedResourceType}
            value={selectedResourceName}
            onChange={(event) => {
              console.log("Name Written:", event.target.value);
              setResourceName(event.target.value);
            }}
            label="Resource Name"
            variant="outlined"
            sx={{
              flex: 1,
              width: "100%",
              mb:2,
              backgroundColor: selectedResourceType ? "#393636" : "#2e2e2e",
              borderRadius: "5px",
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "whitesmoke" },
              "& .MuiInputLabel-root.Mui-focused": { color: "white" },
            }}
          />
          )}
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            {/* LEFT SIDE FORM */}
            <Box flex={1}>
              {/* VERSION */}
              <TextField
              disabled={!selectedResourceName}
              value={selectedResourceVersion}
              onChange={(event) => {
                console.log("Tags Written:", event.target.value);
                setResourceVersion(event.target.value);
              }}
              label="Resource Version"
              variant="outlined"
              sx={{
                flex: 1,
                width: "100%",
                mb:2,
                backgroundColor: selectedResourceName ? "#393636" : "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />

              {/* TITLE */}  
              <TextField
              disabled={!selectedResourceVersion}
              value={newResourceTitle}
              onChange={(event) => {
                console.log("Title Written:", event.target.value);
                setNewResourceTitle(event.target.value);
              }}
              label="Resource Title"
              variant="outlined"
              sx={{
                flex: 1,
                width: "100%",
                mb:2,
                backgroundColor: selectedResourceVersion ? "#393636" : "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />

              {/* CONTENT */}
              <TextField
              disabled={!newResourceTitle}
              value={newResourceContent}
              onChange={(event) => {
                console.log("Content Written:", event.target.value);
                setNewResourceContent(event.target.value);
              }}
              label="Resource Content"
              variant="outlined"
              sx={{
                flex: 1,
                width: "100%",
                mb:2,
                backgroundColor: selectedResourceVersion ? "#393636" : "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />

              {/* POST BUTTON */}
              <Button
                variant="outlined"
                fullWidth
                disabled={!newResourceContent}
                sx={{
                  color: "#ffffff",
                  borderColor: "#90caf9",
                  "&:hover": { borderColor: "#64b5f6" },
                }}
                onClick={handlePost}
              >
                Create Documentation
              </Button>
            </Box>

            {/* RIGHT SIDE IMAGE UPLOAD */}
            {!resouceExistance &&( 
              <Box
              flex={1}
              onDrop={handleDragDrop}
              onDragOver={(e) => e.preventDefault()}
              sx={{
                backgroundColor: newResourceTitle ? "#393636" : "#2e2e2e",
                border: "2px dashed #eee",
                p: 2,
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    {newResourceTitle?"Drag & Drop a Resource Logo here or":"Fill in Resource Title to unlock"}
                  </Typography>
                  {newResourceTitle &&(
                    <Button
                    variant="outlined"
                    sx={{
                      color: "#ffffff",
                      borderColor: "#90caf9",
                      "&:hover": { borderColor: "#64b5f6" },
                    }}
                    onClick={() => fileInputRef.current.click()}
                    >
                    Browse
                  </Button>
                  )}
                </>
              )}
              <input
                type="file"
                disabled={!newResourceTitle}
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </Box>
            )}

          </Stack>
        </Box>
      </Modal>
    </>
  );
}
