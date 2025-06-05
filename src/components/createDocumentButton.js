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
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { usePostContext } from "../data/contextData";
import { resourceType } from "../data/generalData";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import { HexColorPicker } from "react-colorful";

export default function CreateDocumentationButton() {
  const [selectedResourceType, setResourceType] = useState(null);
  const [selectedResourceName, setResourceName] = useState(null);
  const [selectedResourceVersion, setResourceVersion] = useState(null);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceContent, setNewResourceContent] = useState("");
  const [resourceNameOptions, setResourceNameOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#aabbcc");

  const [open, setOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [resouceExistance, setResourceExistance] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const createButtonRef = useRef(null);
  const { dispatch } = usePostContext();
  const { token } = useContext(UserContext);

  const isValidHex = /^#([0-9A-Fa-f]{3}){1,2}$/.test(selectedColor);

  const handleClose = () => {
    setOpen(false);
    resetFormData();
  };

  const handlePost = async () => {
    try {
      const payload = {
        resource_name: selectedResourceName,
        resource_color:selectedColor,
        resource_version: selectedResourceVersion,
        resource_type: selectedResourceType,
        resource_title: newResourceTitle,
        resource_content: newResourceContent,
      };

      if (Object.values(payload).some((val) => !val)) {
        alert("Please fill in all fields.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/documentation",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    setNewResourceTitle("");
    setNewResourceContent("");
    setResourceExistance(null);
  };

  useEffect(() => {
    if (selectedResourceType) {
      setResourceName(null);
      setResourceVersion(null);
      axios
        .get("http://localhost:5000/documentation/names", {
          params: { resourceType: selectedResourceType },
        })
        .then((res) => setResourceNameOptions(res.data))
        .catch((err) => console.error("Failed to fetch names:", err));
    }
  }, [selectedResourceType]);

  useEffect(() => {
    if (
      resouceExistance &&
      selectedResourceName &&
      selectedResourceVersion &&
      selectedResourceType
    ) {
      axios
        .get("http://localhost:5000/documentation/details", {
          params: {
            resourceType: selectedResourceType,
            resourceName: selectedResourceName,
            resourceVersion: selectedResourceVersion,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setNewResourceTitle(res.data.title || "");
          setNewResourceContent(res.data.content || "");
        })
        .catch((err) => {
          console.error("Failed to fetch resource details:", err);
          setNewResourceTitle("");
          setNewResourceContent("");
        });
    }
  }, [resouceExistance, selectedResourceName, selectedResourceVersion]);

  return (
    <>
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

      <Button
        ref={createButtonRef}
        sx={{ backgroundColor: "white", color: "black" }}
        onClick={() => setStepModalOpen(true)}
        aria-label="Create a new post"
      >
        Create Documentation
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
          overflowY: "auto",
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
            Create Documentation {resouceExistance ? "(Existing Resource)" : "(New Resource)"}
          </h2>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Autocomplete
              options={resourceType}
              value={selectedResourceType}
              onChange={(e, value) => {
                setResourceType(value);
                setResourceName(null);
                setResourceVersion(null);
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
              sx={{ flex: 1 }}
            />

            {resouceExistance ? (
              <Autocomplete
                options={resourceNameOptions}
                value={selectedResourceName}
                onChange={(event, newValue) => {
                  setResourceName(newValue);
                  setResourceVersion(null);
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
                sx={{ flex: 1 }}
              />
            ) : (
              <TextField
                disabled={!selectedResourceType}
                value={selectedResourceName || ""}
                onChange={(event) => setResourceName(event.target.value)}
                label="Resource Name"
                variant="outlined"
                sx={{
                  flex: 1,
                  backgroundColor: selectedResourceType ? "#393636" : "#2e2e2e",
                  borderRadius: "5px",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "whitesmoke" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                }}
              />
            )}

            <TextField
              disabled={!selectedResourceName}
              value={selectedResourceVersion || ""}
              onChange={(event) => setResourceVersion(event.target.value)}
              label="Resource Version"
              variant="outlined"
              sx={{
                flex: 1,
                backgroundColor: selectedResourceName ? "#393636" : "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />
          </Stack>

          <Stack direction="row" spacing={3} sx={{ height: 320 }}>
            {!resouceExistance && (
              <Box
                sx={{
                  width: "40%",
                  bgcolor: "#393636",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Choose Resource Color:
                </Typography>
                <Box sx={{ flexGrow: 1, mb: 2 }}>
                  <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
                <FormControl variant="outlined">
                  <InputLabel
                    shrink
                    sx={{
                      color: "whitesmoke",
                      "&.Mui-focused": { color: "white" },
                    }}
                  >
                    Hex Color
                  </InputLabel>
                  <OutlinedInput
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    error={!isValidHex}
                    sx={{
                      backgroundColor: "#2e2e2e",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#888" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#aaa" },
                    }}
                    label="Hex Color"
                  />
                </FormControl>
                <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#ccc" }}>
                  Selected: {selectedColor}
                </Typography>
              </Box>
            )}

            <Stack spacing={2} sx={{ width: resouceExistance ? "100%" : "60%", height: "100%" }}>
              <TextField
                disabled={!selectedResourceVersion}
                value={newResourceTitle || ""}
                onChange={(event) => setNewResourceTitle(event.target.value)}
                label="Resource Title"
                variant="outlined"
                sx={{
                  backgroundColor: selectedResourceVersion ? "#393636" : "#2e2e2e",
                  borderRadius: "5px",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "whitesmoke" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                }}
              />
              <TextField
                disabled={!newResourceTitle}
                value={newResourceContent || ""}
                onChange={(event) => setNewResourceContent(event.target.value)}
                label="Resource Content"
                variant="outlined"
                multiline
                rows={9}
                sx={{
                  flex: 1,
                  minHeight: 200,
                  borderRadius: "5px",
                  "& .MuiInputBase-root": {
                    backgroundColor: selectedResourceVersion ? "#393636" : "#2e2e2e",
                    borderRadius: "5px",
                  },
                  "& .MuiInputBase-inputMultiline": {
                    color: "white",
                    backgroundColor: "transparent", // inherits from root
                  },
                  "& .MuiInputLabel-root": { color: "whitesmoke" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                }}
              />
            </Stack>
          </Stack>

          <Button
            variant="outlined"
            fullWidth
            disabled={!newResourceContent}
            sx={{
              mt: 3,
              color: "#ffffff",
              borderColor: "#90caf9",
              "&:hover": { borderColor: "#64b5f6" },
            }}
            onClick={handlePost}
          >
            Create Post
          </Button>
        </Box>
      </Modal>
    </>
  );
}