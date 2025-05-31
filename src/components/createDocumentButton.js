import { useContext, useEffect, useRef, useState } from "react";
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
import {resourceType } from "../data/generalData";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

export default function CreateDocumentationButton() {

  const [selectedResourceType, setResourceType] = useState(null);
  const [selectedResourceName, setResourceName] = useState(null);
  const [selectedResourceVersion, setResourceVersion] = useState(null);
  const [newResourceTitle, setNewResourceTitle] = useState(null);
  const [newResourceContent, setNewResourceContent] = useState(null);
  const [resourceNameOptions, setResourceNameOptions] = useState([]);
  
  const [open, setOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [resouceExistance, setResourceExistance] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const createButtonRef = useRef(null);
  const { dispatch } = usePostContext();

  

  const handleClose = () => {
    setOpen(false);
    resetFormData();
  };

  const { token } = useContext(UserContext);

  const handlePost = async () => {
    try {
        const payload = {
            resource_name: selectedResourceName,
            resource_version: selectedResourceVersion,
            resource_type: selectedResourceType,
            resource_title: newResourceTitle,
            resource_content: newResourceContent,
        };

        // Validate if all fields are filled
        if (Object.values(payload).some(val => !val)) {
            alert("Please fill in all fields.");
            return;
        }

        const response = await axios.post("http://localhost:5000/documentation", payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 201) {
            dispatch({ type: "ADD_POST", payload });
            setSnackbarOpen(true);
            handleClose();
            createButtonRef.current?.focus();
        }
    } catch (err) {
        if (err.response) {
            alert(`Error: ${err.response.data.message}`);
        } else {
            console.error("Error submitting documentation:", err);
        }
    }
  };


  const resetFormData = () => {
    setResourceType(null);
    setResourceName(null);
    setResourceVersion(null);
    setNewResourceTitle(null);
    setNewResourceContent(null);
    setResourceExistance(null);
  };

  useEffect(() => {
    if (selectedResourceType) {
      setResourceName(null);
      setResourceVersion(null);
      axios.get("http://localhost:5000/documentation/names", {
        params: { resourceType: selectedResourceType },
      })
        .then(res => setResourceNameOptions(res.data))
        .catch(err => console.error("Failed to fetch names:", err));
    }
  }, [selectedResourceType]);

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
              setResourceVersion(null);
              console.log("Selected Type", value);
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
          {resouceExistance ? (
            <Autocomplete
              options={resourceNameOptions}
              value={selectedResourceName}
              onChange={(event, newValue) => {
                setResourceName(newValue);
                setResourceVersion(null);
                console.log("Selected Name:", newValue);
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
          ) : (
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
                mb: 2,
                backgroundColor: selectedResourceType ? "#393636" : "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />
          )}

          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
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
                  mb: 2,
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
                  mb: 2,
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
                  mb: 2,
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
                Create Post
              </Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
