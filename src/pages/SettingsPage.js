import React, { useState } from "react";
import TopNavbar from "../components/topNavbar";
import {
  Box,
  Card,
  Typography,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
} from "@mui/material";
import { programmingLanguages } from "../data/languageData";

function SettingsPage() {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [feedPrivacy, setFeedPrivacy] = useState("public");
  const [messagesAllowed, setMessagesAllowed] = useState(true);

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "white" },
      "&:hover fieldset": { borderColor: "#00bcd4" },
      "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
    },
    input: { color: "white" },
    label: { color: "white" },
    backgroundColor: "#4a4a4a",
    borderRadius: "5px",
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
        SETTINGS
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", width: "80%", marginLeft: "20%", paddingTop: "20px",backgroundColor:"#181818",minHeight:'90vh'}}>
        <Box sx={{ width: "95%" }}>
          {/* Settings Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            {/* Profile Settings */}
            <Card sx={{ backgroundColor: "#393636", padding: "20px", color: "white" }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: "white" }}>
                Profile Settings
              </Typography>
              <TextField label="Username" variant="outlined" fullWidth sx={{ mt: 2, ...inputStyles }} />
              <TextField label="Email" variant="outlined" fullWidth sx={{ mt: 2, ...inputStyles }} />
              <TextField label="New Password" type="password" variant="outlined" fullWidth sx={{ mt: 2, ...inputStyles }} />
            </Card>

            {/* Customization */}
            <Card sx={{ backgroundColor: "#393636", padding: "20px", color: "white" }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: "white" }}>
                Customization
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: "white" }}>Theme</InputLabel>
                <Select value={theme} onChange={(e) => setTheme(e.target.value)} sx={inputStyles}>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
            </Card>


            <Card sx={{ backgroundColor: "#393636", padding: "20px", color: "white" }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: "white" }}>
                Preferred Languages
              </Typography>
              <Autocomplete
                multiple
                options={programmingLanguages}
                value={selectedLanguages}
                onChange={(event, newValue) => setSelectedLanguages(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Languages" sx={inputStyles} />
                )}
              />
            </Card>

            <Card sx={{ backgroundColor: "#393636", padding: "20px", color: "white" }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: "white" }}>
                Privacy Settings
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ color: "white" }}>Feed Privacy</InputLabel>
                <Select value={feedPrivacy} onChange={(e) => setFeedPrivacy(e.target.value)} sx={inputStyles}>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Typography>Allow Messages</Typography>
                <Switch checked={messagesAllowed} onChange={() => setMessagesAllowed(!messagesAllowed)} />
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default SettingsPage;
