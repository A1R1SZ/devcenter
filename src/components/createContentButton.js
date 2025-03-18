import { useRef, useState } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Autocomplete,
  Stack,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { programmingLanguages, languageVersions } from "../data/languageData";
import { usePostContext } from "../data/contextData";

const contentTypes = ["Language", "Tool", "Package"];
const tagsOptions = ["AI", "Backend", "Frontend", "Data Science", "DevOps", "Mobile", "Cloud", "Web3", "Security"];

export default function CreateContentButton() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    typeOfContent: null,
    selectedLanguage: null,
    selectedVersion: null,
    tags: [],
    imageName: "",
    imagePreview: "",
    title: "",
    content: "",
  });
  const [touched, setTouched] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fileInputRef = useRef(null);
  const createButtonRef = useRef(null);
  const { dispatch } = usePostContext();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      typeOfContent: null,
      selectedLanguage: null,
      selectedVersion: null,
      tags: [],
      imageName: "",
      imagePreview: "",
      title: "",
      content: "",
    });
    setTouched({});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageName: file.name }));
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
    dispatch({ type: "ADD_POST", payload: formData });
    handleClose();
    setSnackbarOpen(true);
    createButtonRef.current.focus();
  };

  const isFormValid = formData.title && formData.typeOfContent && formData.content;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showError = (field) => !formData[field] && touched[field];

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
        Create Post
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
          <h2 style={{ marginBottom: "16px" }}>Create Post</h2>

          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            {/* Form Section */}
            <Box flex={1}>
              {/* Title */}
              <TextField
                label="Title"
                multiline
                rows={1}
                fullWidth
                variant="filled"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={() => handleBlur("title")}
                sx={{
                  mb: 1,
                  bgcolor: "#393636",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "whitesmoke" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                }}
              />
              {showError("title") && (
                <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
                  Title is required
                </Typography>
              )}

              {/* Type of Content */}
              <TextField
                select
                label="Type of Content"
                value={formData.typeOfContent || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    typeOfContent: e.target.value,
                    selectedLanguage: null,
                    selectedVersion: null,
                  }))
                }
                onBlur={() => handleBlur("typeOfContent")}
                variant="filled"
                fullWidth
                sx={{
                  mb: 1,
                  bgcolor: "#393636",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "whitesmoke" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                }}
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              {showError("typeOfContent") && (
                <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
                  Type of content is required
                </Typography>
              )}

              {/* Conditionally render Language and Version */}
              {formData.typeOfContent === "Language" && (
                <Stack direction="row" spacing={2} mb={2}>
                  <Autocomplete
                    options={programmingLanguages}
                    value={formData.selectedLanguage}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        selectedLanguage: newValue,
                        selectedVersion: null,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Language"
                        variant="filled"
                        sx={{
                          bgcolor: "#393636",
                          "& .MuiInputBase-input": { color: "white" },
                          "& .MuiInputLabel-root": { color: "whitesmoke" },
                          "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                        }}
                      />
                    )}
                    sx={{
                      flex: 1,
                      "& .MuiAutocomplete-popupIndicator": { color: "white" },
                      "& .MuiAutocomplete-clearIndicator": { color: "white" },
                    }}
                  />

                  <Autocomplete
                    options={
                      formData.selectedLanguage ? languageVersions[formData.selectedLanguage] || [] : []
                    }
                    value={formData.selectedVersion}
                    onChange={(event, newValue) =>
                      setFormData((prev) => ({ ...prev, selectedVersion: newValue }))
                    }
                    disabled={!formData.selectedLanguage}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Version"
                        variant="filled"
                        sx={{
                          bgcolor: formData.selectedLanguage ? "#393636" : "#2e2e2e",
                          "& .MuiInputBase-input": { color: "white" },
                          "& .MuiInputLabel-root": { color: "whitesmoke" },
                          "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                        }}
                      />
                    )}
                    sx={{
                      flex: 1,
                      "& .MuiAutocomplete-popupIndicator": { color: "white" },
                      "& .MuiAutocomplete-clearIndicator": { color: "white" },
                    }}
                  />
                </Stack>
              )}

              {/* Tags Multi-Select */}
              <Autocomplete
                multiple
                options={tagsOptions}
                value={formData.tags}
                onChange={(event, newValue) =>
                  setFormData((prev) => ({ ...prev, tags: newValue }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    variant="filled"
                    sx={{
                      bgcolor: "#393636",
                      "& .MuiInputBase-input": { color: "white" },
                      "& .MuiInputLabel-root": { color: "whitesmoke" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                    }}
                  />
                )}
                sx={{
                  mb: 2,
                  "& .MuiAutocomplete-popupIndicator": { color: "white" },
                  "& .MuiAutocomplete-clearIndicator": { color: "white" },
                  "& .MuiChip-root": { bgcolor: "#4b4b4b", color: "white" },
                }}
              />

              {/* Content */}
              <TextField
                label="Content"
                multiline
                rows={6}
                fullWidth
                variant="filled"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                onBlur={() => handleBlur("content")}
                sx={{
                  bgcolor: "#393636",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "whitesmoke" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                }}
              />
              {showError("content") && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  Content is required
                </Typography>
              )}
            </Box>

            {/* Image Upload Section */}
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
                accept="image/*"
              />
              <Box
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current.click()}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && fileInputRef.current.click()
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                sx={{
                  width: "100%",
                  height: "300px",
                  bgcolor: "#444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  mb: 2,
                  border: "2px dashed #888",
                }}
              >
                {formData.imagePreview ? (
                  <Box
                    component="img"
                    src={formData.imagePreview}
                    alt="Preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  "Drag & drop or click to upload image"
                )}
              </Box>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            onClick={handlePost}
            disabled={!isFormValid}
            aria-label="Submit post"
          >
            Post
          </Button>
        </Box>
      </Modal>
    </>
  );
}
