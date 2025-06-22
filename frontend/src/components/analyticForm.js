// src/components/AnalyticForm.js
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Slider
} from '@mui/material';

const AnalyticForm = ({ formData, setFormData, handleSubmit,disabled = false }) => {
  return (
    <Accordion
      sx={{
        width: "25%",
        left: "1%",
        position: "absolute",
        top: "2.5%",
        height: "90%",
        bgcolor: "#2A2828",
        color: "white",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
      }}
      defaultExpanded
    >
      <AccordionSummary>
        <Typography><b>Analytics Form</b></Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography sx={{ mb: 1, color: '#aaa' }}>
            How useful is this documentation? ({formData.usefulness}/5)
          </Typography>
          <Slider
            value={formData.usefulness}
            onChange={(e, newValue) => !disabled && setFormData({ ...formData, usefulness: newValue })}
            min={1}
            max={5}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ color: 'cyan' }}
          />
        </Box>

        {/* 👍 Recommendation Slider */}
        <Box>
          <Typography sx={{ mb: 1, color: '#aaa' }}>
            Would you recommend this update? ({formData.recommendation}/5)
          </Typography>
          <Slider
            value={formData.recommendation}
            onChange={(e, newValue) => !disabled && setFormData({ ...formData, recommendation: newValue })}
            min={1}
            max={5}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ color: 'limegreen' }}
          />
        </Box>

        {/* 👍 Clarity Slider */}
        <Box>
          <Typography sx={{ mb: 1, color: '#aaa' }}>
            Is the documentation easily to understand? ({formData.clarity}/5)
          </Typography>
          <Slider
            value={formData.clarity}
            onChange={(e, newValue) => !disabled && setFormData({ ...formData, clarity: newValue })}
            min={1}
            max={5}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ color: 'lightpink' }}
          />
        </Box>

        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ bgcolor: "#3F51B5", color: "white", mt: "auto" }}
          disabled={disabled}
        >
          {disabled ? "Already Submitted" : "Submit Analytics"}
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};

export default AnalyticForm;
