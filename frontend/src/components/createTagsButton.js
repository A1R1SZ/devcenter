import { useContext, useEffect, useRef, useState } from "react";
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
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

export default function CreateTagsButton() {
    const [open, setOpen] = useState(false);

    const [selectedResourceType,setResourceType] = useState(null);
    const [selectedResourceName,setResourceName] = useState(null);
    const [selectedResourceVersion,setResourceVersion] = useState(null);
    const [newTags, setNewTags] = useState("");

    const [resourceNameOptions, setResourceNameOptions] = useState([]);
    const [resourceVersionOptions, setResourceVersionOptions] = useState([]);

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

const handlePost = async () => {
  try{
    const payload = {
      selectedResources: selectedResourceName,
      selectedVersion: selectedResourceVersion,
      newTags: newTags,
    };


    const response = await axios.post("http://localhost:5000/tag", payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("Final Form Data:", payload);
    if(response.status === 201){
      handleClose();
      setSnackbarOpen(true);
      createButtonRef.current.focus();
    }
  }catch(err){
    if (err.response) {
        alert(`Error: ${err.response.data.message}`);
    } else {
        console.error("Error submitting documentation:", err);
    }
  }
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
              options={resourceNameOptions}
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
