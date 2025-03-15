import React, { useState } from "react";
import TopNavbar from "../components/topNavbar";
import { Box, Card, Typography, Autocomplete, TextField } from "@mui/material";
import { programmingLanguages, languageColors, languageVersions } from "../data/languageData"; // Import data

function DocumentationPage() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);

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
      <Box sx={{ display: "flex", justifyContent: "center", width: "80%", marginLeft: "20%", paddingTop: "20px",backgroundColor:"#181818",minHeight:'90vh'}}>
        <Box sx={{ width: "95%" }}>
          {/* Language and Version Selectors in Flexbox */}
          <Box sx={{ display: "flex", gap: "10px", marginBottom: "10px",marginTop:'25px' }}>
            {/* Programming Language Selector */}
            <Autocomplete
              options={programmingLanguages}
              value={selectedLanguage}
              onChange={(event, newValue) => {
                setSelectedLanguage(newValue);
                setSelectedVersion(null); // Reset version when language changes
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

            {/* Version Selector (Conditional) */}
            <Autocomplete
              options={selectedLanguage ? languageVersions[selectedLanguage] || [] : []}
              value={selectedVersion}
              onChange={(event, newValue) => setSelectedVersion(newValue)}
              disabled={!selectedLanguage} // Disable if no language is selected
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Version"
                  variant="outlined"
                  sx={{
                    backgroundColor: selectedLanguage ? "#393636" : "#2e2e2e",
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
            <Box
            sx={{display:'flex'}}
            >
                {/* Language Typography */}
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

                {/* Version Typography (only show if a version is selected) */}
                {selectedVersion && (
                <Typography
                    sx={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: "whitesmoke",
                    marginTop: "20px",
                    marginLeft:'10px',
                    }}
                >
                    Version: {selectedVersion}
                </Typography>
                )}
            </Box>
            <Card
            sx={{backgroundColor:'#2A2828',color:'white',padding:'20px'}}
            >
                'Paste here'
            </Card>
          </Card>
        </Box>
      </Box>
    </>
  );
}

export default DocumentationPage;
