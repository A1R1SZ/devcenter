import React from "react";
import TopNavbar from "../components/topNavbar";
import { Box, Card, Typography, Grid } from "@mui/material";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

// Data Definitions
const devPopularityData = [
  { name: "JavaScript", value: 40 },
  { name: "Python", value: 30 },
  { name: "Java", value: 15 },
  { name: "C#", value: 10 },
  { name: "Others", value: 5 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A83279"];

const trendData = [
  { year: "2020", JavaScript: 65, Python: 50, Java: 40, CSharp: 30 },
  { year: "2021", JavaScript: 70, Python: 55, Java: 42, CSharp: 35 },
  { year: "2022", JavaScript: 75, Python: 60, Java: 45, CSharp: 38 },
  { year: "2023", JavaScript: 80, Python: 70, Java: 50, CSharp: 40 },
];

const contentData = [
  { name: "JavaScript", contents: 400, engagement: 320, recommendations: 290 },
  { name: "Python", contents: 350, engagement: 290, recommendations: 270 },
  { name: "Java", contents: 280, engagement: 240, recommendations: 220 },
  { name: "C#", contents: 220, engagement: 180, recommendations: 160 },
];

const bugFixData = [
  { name: "JavaScript", bugs: 80, fixes: 75 },
  { name: "Python", bugs: 60, fixes: 58 },
  { name: "Java", bugs: 50, fixes: 45 },
  { name: "C#", bugs: 40, fixes: 38 },
];

function AnalyticsPage() {
  return (
    <>
      <TopNavbar />
      
      {/* Fixed Title Position */}
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
        ANALYTICS
      </Typography>
      
      <Box sx={{ display: "flex", justifyContent: "center", width: "80%", marginLeft: "20%", paddingTop: "20px",backgroundColor:"#181818",minHeight:'90vh'}}>
        <Box sx={{ width: "95%" }}>
          <Grid container spacing={2}>
            {/* Developer Popularity */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#2A2828", padding: "15px", color: "white" }}>
                <Typography variant="h6">Developer Popularity</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={devPopularityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {devPopularityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Trend Popularity */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#2A2828", padding: "15px", color: "white" }}>
                <Typography variant="h6">Language Popularity Trends</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="year" stroke="#ccc" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="JavaScript" stroke="#0088FE" />
                    <Line type="monotone" dataKey="Python" stroke="#00C49F" />
                    <Line type="monotone" dataKey="Java" stroke="#FFBB28" />
                    <Line type="monotone" dataKey="CSharp" stroke="#FF8042" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Creative Content & Engagement */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#2A2828", padding: "15px", color: "white" }}>
                <Typography variant="h6">Content, Engagement & Recommendations</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={contentData}>
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="contents" fill="#0088FE" name="Contents" />
                    <Bar dataKey="engagement" fill="#00C49F" name="Engagement" />
                    <Bar dataKey="recommendations" fill="#FFBB28" name="Recommendations" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Bug to Fix Ratio */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#2A2828", padding: "15px", color: "white" }}>
                <Typography variant="h6">Bug to Fix Ratio</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bugFixData}>
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bugs" fill="#FF8042" name="Bugs" />
                    <Bar dataKey="fixes" fill="#00C49F" name="Fixes" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default AnalyticsPage;
