import React, { useEffect, useState } from "react";
import TopNavbar from "../components/topNavbar";
import {
  Box,

  Typography,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";


function SettingsPage() {
  const baseURL = process.env.REACT_APP_API_URL;
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [password, setPassword] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog,setOpenEditDialog] = useState(false);
  const [editType,setEditType]= useState("");

  const [tempUsername, setTempUsername] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [confirmUsername, setconfirmUsername] = useState("");
  const [confirmEmail, setconfirmEmail] = useState("");

  const navigate = useNavigate();

  

  function getMaskedEmail(email) {
    if (!email || email.length < 3) return email;
    const visible = email.slice(0, 3);
    const obfuscated = email.slice(3).replace(/./g, "*");
    return visible + obfuscated;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${baseURL}/get-profile-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Profile Info:",data)
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleDeleteProfile = async () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username"); 
  
    if (!token) {
      alert("You must be logged in to delete your profile.");
      return;
    }
  
    try {
      const response = await fetch(`${baseURL}/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ username,password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Profile deleted successfully!");
        localStorage.removeItem("token");
        sessionStorage.removeItem('token');
        localStorage.removeItem("settings");
        setOpenDeleteDialog(false);
        navigate('/');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  const handleSave = async () => {
    const token = localStorage.getItem("token");
  
    // Simple client-side validation
    if (editType === "username" && tempUsername !== confirmUsername) {
      alert("Usernames do not match.");
      return;
    }
    if (editType === "email" && tempEmail !== confirmEmail) {
      alert("Emails do not match.");
      return;
    }
  
    try {
      const response = await fetch(`${baseURL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newUsername: editType === "username" ? tempUsername : undefined,
          newEmail: editType === "email" ? tempEmail : undefined,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Profile updated successfully!");
        setProfile((prev) => ({
          ...prev,
          username: editType === "username" ? tempUsername : prev.username,
          email: editType === "email" ? tempEmail : prev.email,
        }));
        setOpenEditDialog(false);
        setTempUsername("");
        setTempEmail("");
        setconfirmUsername("");
        setconfirmEmail("");
        window.location.reload();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("Something went wrong while updating.");
    }
  };
  

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

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "80%",
          marginLeft: "20%",
          paddingTop: "20px",
          backgroundColor: "#181818",
          minHeight: "90vh",
        }}
      >
        {/* <Box sx={{ width: "50%" }}>
          <Card sx={{padding:"10px",backgroundColor: "#393636",}}>
            <TextField 
              label='Current Username' 
              required 
              fullWidth 
              margin='normal' 
              sx={{
                backgroundColor: "#393636",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />
            <TextField 
              label='Password' 
              required 
              type='password' 
              fullWidth 
              margin='normal'
              sx={{
                backgroundColor: "#393636",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputLabel-root": { color: "whitesmoke" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />
          <Button variant="contained" color="error" sx={{mt:2 ,width:"50%"}} onClick={() => setOpenDeleteDialog(true)}>
                  Delete Profile
          </Button>
          </Card>
        </Box> */}
        <Box sx={{width:"95%"}}>
          <Card sx={{padding:"15px",backgroundColor: "#393636",}}>
            <Typography color="White">Personal Information</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography color="white">Username: {profile.username}</Typography>
                <Button 
                  size="small" 
                  onClick={() => {
                    setOpenEditDialog(true);
                    setEditType("username");
                  }}
                >
                  Change
                </Button>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography color="white">Email:{ getMaskedEmail(profile.email)}</Typography>
                <Button 
                  size="small" 
                  onClick={() => {
                    setOpenEditDialog(true);
                    setEditType("email");
                  }}
                >
                  Change
                </Button>
              </Box> 
            </Box>

            <Button style={{backgroundColor:"white"}}>Save Profile</Button>
          </Card>
        </Box>
      </Box>
      <Dialog open={openEditDialog} onClose={()=> setOpenEditDialog(false)}>
      <DialogTitle sx={{backgroundColor: "#393636",color:"white"}}>{editType === "username"?" Change Username":editType === "email"?"Change Email":<></>}</DialogTitle>
      <DialogContent sx={{backgroundColor: "#393636", color:"white"}}>
        <TextField
          fullWidth
          sx={{ mt: 2, ...inputStyles,color:"white" }}
          label={editType === "username"?"New Username":editType==="email"?"New Email":<></>}
          value={editType === "username"?tempUsername:editType==="email"?tempEmail:<></>}
          onChange={(e)=>{editType === "username"?setTempUsername(e.target.value):editType === "email"?setTempEmail(e.target.value):<></>}}
        />
        <TextField
          fullWidth
          sx={{ mt: 2, ...inputStyles,color:"white" }}
          label={editType === "username"?"Confirm Username":editType==="email"?"Confirm Email":<></>}
          value={editType === "username"?confirmUsername:editType==="email"?confirmEmail:<></>}
          onChange={(e)=>{editType === "username"?setconfirmUsername(e.target.value):editType === "email"?setconfirmEmail(e.target.value):<></>}}
        />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#393636" }}>
        <Button onClick={() => setOpenEditDialog(false)} sx={{ color: "white" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} sx={{ color: "white" }}>
          Confirm
        </Button>
      </DialogActions>
      </Dialog>

      {/* Delete Profile Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{backgroundColor: "#393636",color:"white"}}>Delete Profile</DialogTitle>
        <DialogContent sx={{backgroundColor: "#393636", color:"white"}}>
          <DialogContentText sx={{color:"white"}}>Are you sure you want to delete your profile? This action cannot be undone.</DialogContentText>
          <TextField
                label="Confirmation Password"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mt: 2, ...inputStyles }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
        </DialogContent>
        <DialogActions sx={{backgroundColor: "#393636",color:"white"}}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary" sx={{backgroundColor:"white"}}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProfile} color="black"sx={{backgroundColor:"red"}}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SettingsPage;
