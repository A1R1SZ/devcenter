import React, { useState } from "react";
import TopNavbar from "../components/topNavbar";
import { Box, Card, Typography, Autocomplete, TextField, Chip, Button } from "@mui/material";
import { programmingLanguages, languageColors ,tagsData } from "../data/languageData";


function TagsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = selectedLanguage ? tagsData[selectedLanguage] || [] : [];

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
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
      <Box sx={{ display: "flex", justifyContent: "center", width: "80%", marginLeft: "20%", paddingTop: "20px",backgroundColor:"#181818",minHeight:'90vh'}}>
        <Box sx={{ width: "95%" }}>
          {/* Language Selector */}
          <Box sx={{ display: "flex", gap: "10px", marginBottom: "10px", marginTop: "25px" }}>
            <Autocomplete
              options={programmingLanguages}
              value={selectedLanguage}
              onChange={(event, newValue) => {
                setSelectedLanguage(newValue);
                setSelectedTags([]); // Reset tags when changing language
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Language"
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
            <Button
                sx={{
                cursor: "pointer",
                backgroundColor:  "green",
                color: "white",
                "&:hover": {
                    backgroundColor: "darkgreen",
                },
                }}
            >Filtered Search
            </Button>
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
            <Box sx={{ display: "flex" }}>
              <Typography
                sx={{
                  fontSize: 50,
                  fontWeight: 600,
                  color: selectedLanguage ? languageColors[selectedLanguage] : "white",
                  textTransform: "uppercase",
                }}
              >
                {selectedLanguage || "Select Language"}
              </Typography>
            </Box>

            <Card sx={{ backgroundColor: "#2A2828", color: "white", padding: "20px", marginTop: "20px" }}>
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                Available Tags:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagClick(tag)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: selectedTags.includes(tag) ? "#007AFF" : "#555",
                        color: "white",
                        "&:hover": {
                          backgroundColor: selectedTags.includes(tag) ? "#005FCC" : "#777",
                        },
                      }}
                    />
                  ))
                ) : (
                  <Typography>No tags available. Select a language.</Typography>
                )}
              </Box>
            </Card>
          </Card>
        </Box>
      </Box>
    </>
  );
}

export default TagsPage;
