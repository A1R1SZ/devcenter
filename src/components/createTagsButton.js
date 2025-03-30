import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Box,
  Snackbar,
  Alert,
  Autocomplete,
  TextField,
} from "@mui/material";
import { usePostContext } from "../data/contextData";
import { resourceName, resourceType, resourceVersion } from "../data/generalData";

export default function CreateTagsButton() {
    const [open, setOpen] = useState(false);

    const [selectedResourceType,setResourceType] = useState(null);
    const [selectedResourceName,setResourceName] = useState(null);
    const [selectedResourceVersion,setResourceVersion] = useState(null);
    const [newTags, setNewTags] = useState("");


    const resourceDataName =
    selectedResourceType === "Language"
    ? resourceName[0] || []
    : selectedResourceType === "Tools" || selectedResourceType === "Package"
    ? resourceName[1] || []
    : [];
    
    const resourceDataVersion =
    selectedResourceType === "Language" && selectedResourceName
        ? resourceVersion[0][selectedResourceName] || []
        : [];
      

  const [formData, setFormData] = useState({
    resourceType: selectedResourceType,
    selectedResources: selectedResourceName,
    selectedVersion: selectedResourceVersion,
    newTags:newTags,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const createButtonRef = useRef(null);
  const { dispatch } = usePostContext();


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      resourceType: null,
      selectedResources: null,
      selectedVersion: null,
      tags:null,
      newTags:null,
    });
    setResourceName("");
    setResourceType("");
    setResourceVersion("");
    setNewTags("");
    console.log("ResetForm:",formData);
  };

const handlePost = () => {
  const updatedFormData = {
    resourceType: selectedResourceType,
    selectedResources: selectedResourceName,
    selectedVersion: selectedResourceVersion,
    newTags: newTags,
  };

  console.log("Final Form Data:", updatedFormData);

  dispatch({ type: "ADD_POST", payload: updatedFormData });

  handleClose();
  setSnackbarOpen(true);
  createButtonRef.current.focus();
};


  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          Post created successfully!
        </Alert>
      </Snackbar>

      <Button
        ref={createButtonRef}
        sx={{ backgroundColor: "white", color: "black" }}
        onClick={handleOpen}
        aria-label="Create a new post"
      >
        Create Tag
      </Button>

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
          <h2 style={{ marginBottom: "16px" }}>Create Tags</h2>

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

            <Autocomplete
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
            />

            <Autocomplete
                options={resourceDataVersion || []}
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
                mb: 2,
                backgroundColor: "#393636",
                flex: 1,
                }}
            />
            
            <TextField
              disabled={!selectedResourceVersion}
              value={newTags}
              onChange={(event) => {
                console.log("Tags Written:", event.target.value);
                setNewTags(event.target.value);
              }}
              label="Resource Tag"
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

          <Button
            variant="contained"
            color="primary"
            onClick={handlePost}
            disabled={!newTags}
            aria-label="Submit post"
          >
            Post
          </Button>
        </Box>
      </Modal>
    </>
  );
}
