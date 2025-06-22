import React, { useEffect, useState } from "react";
import TopNavbar from "../components/topNavbar";
import {
  Box,
  Card,
  Typography,
  Autocomplete,
  TextField,
  Stack,
  Grid,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import { resourceType } from "../data/generalData";
import axios from "axios";

function AnalyticsPage() {
  const [selectedResourceType, setResourceType] = useState(null);
  const [selectedResourceName, setResourceName] = useState(null);
  const [selectedResourceVersion, setResourceVersion] = useState(null);

  const [resourceNameOptions, setResourceNameOptions] = useState([]);
  const [resourceVersionOptions, setResourceVersionOptions] = useState([]);
  const [resourceColor, setResourceColor] = useState(null);
  const [followerCount, setFollowerCount] = useState(null);
  const [monthlyPostData, setMonthlyPostData] = useState([]);


  const [totalPosts, setTotalPosts] = useState(null);
  const [bugFixPieData, setBugFixPieData] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [feedbackScores, setFeedbackScores] = useState({
    usefulness: null,
    recommendation: null,
    clarity: null,
  });


  useEffect(() => {
    if (selectedResourceType) {
      setResourceName(null);
      setResourceVersion(null);
      axios
        .get("https://devcenter-kofh.onrender.com/documentation/names", {
          params: { resourceType: selectedResourceType },
        })
        .then((res) => setResourceNameOptions(res.data))
        .catch((err) => console.error("Failed to fetch names:", err));
    }
  }, [selectedResourceType]);

  useEffect(() => {
    axios.get("https://devcenter-kofh.onrender.com/api/analytics/posts-per-month")
      .then((res) => {
        setMonthlyPostData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching posts per month:", err);
        setMonthlyPostData([]);
      });
  }, []);

  useEffect(() => {
    if (selectedResourceType && selectedResourceName) {
      setResourceVersion(null);
      axios
        .get("https://devcenter-kofh.onrender.com/documentation/versions", {
          params: {
            resourceType: selectedResourceType,
            resourceName: selectedResourceName,
          },
        })
        .then((res) => setResourceVersionOptions(res.data))
        .catch((err) => console.error("Failed to fetch versions:", err));

      axios
        .get("https://devcenter-kofh.onrender.com/color", {
          params: {
            resourceName: selectedResourceName,
          },
        })
        .then((res) => {
          if (res.data.length > 0) {
            setResourceColor(res.data[0].resource_color);
          } else {
            setResourceColor("white");
          }
        })
        .catch((err) => console.error("Failed to fetch color:", err));
    }
  }, [selectedResourceName]);

  useEffect(() => {
  if (selectedResourceName && selectedResourceVersion) {
    const token = localStorage.getItem("token");

    // Summary
    axios.get("https://devcenter-kofh.onrender.com/api/analytics/summary", {
      params: {
        resourceName: selectedResourceName,
        resourceVersion: selectedResourceVersion,
      },
    })
    .then((res) => {
      setTotalPosts(res.data.totalPosts);
      setBugFixPieData(res.data.bugFixData);
    })
    .catch((err) => {
      console.error("Failed to fetch analytics summary:", err);
      setBugFixPieData([]);
    });

    // Tags
    axios.get("https://devcenter-kofh.onrender.com/api/analytics/popular-tags", {
      params: {
        resourceName: selectedResourceName,
        resourceVersion: selectedResourceVersion,
      }
    })
    .then((res) => {
      setPopularTags(res.data);
    })
    .catch((err) => {
      console.error("Failed to fetch popular tags:", err);
      setPopularTags([]);
    });

    // Feedback
    axios.get("https://devcenter-kofh.onrender.com/api/analytics/feedback", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        resourceName: selectedResourceName,
        resourceVersion: selectedResourceVersion,
      },
    })
    .then((res) => {
      setFeedbackScores(res.data);
      const values = Object.values(res.data).filter(v => typeof v === 'number');
      const overallAverage = values.length
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
        : null;
      setFeedbackScores(prev => ({ ...prev, overall: overallAverage }));
    })
    .catch((err) => {
      console.error("Failed to fetch feedback scores:", err);
      setFeedbackScores({ usefulness: null, recommendation: null, clarity: null });
    });

    // Total posts (again – optional depending if you want to overwrite)
    axios.get("https://devcenter-kofh.onrender.com/api/analytics/total-posts", {
      params: {
        resourceName: selectedResourceName,
        resourceVersion: selectedResourceVersion,
      },
    })
    .then((res) => {
      setTotalPosts(res.data.totalPosts);
    })
    .catch((err) => {
      console.error("Failed to fetch total posts:", err);
      setTotalPosts(null);
    });
    axios.get("https://devcenter-kofh.onrender.com/api/analytics/follower-count", {
      params: {
        resourceName: selectedResourceName,
        resourceVersion: selectedResourceVersion,
      },
    })
    .then((res) => {
      setFollowerCount(res.data.followerCount);
    })
    .catch((err) => {
      console.error("Failed to fetch follower count:", err);
      setFollowerCount(null);
    });
  }
}, [selectedResourceName, selectedResourceVersion]);





  return (
    <>
      <TopNavbar />

      {/* Fixed Title */}
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
        <Box sx={{ width: "95%" }}>
          <Typography sx={{ color: "white", fontWeight: 600, fontSize: 30 }}>
            GENERAL DATA
          </Typography>
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: "#2A2828", color: "white", padding: "20px" }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Posts by Resource
                </Typography>
                {monthlyPostData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyPostData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip />
                      {/* Dynamically draw lines for each resource */}
                      {[...new Set(monthlyPostData.map(d => d.resource_name))].map((name, idx) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={(entry) => entry.resource_name === name ? entry.post_count : null}
                          name={name}
                          stroke={`hsl(${(idx * 60) % 360}, 100%, 60%)`}
                          dot={false}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="gray">
                    No data available.
                  </Typography>
                )}
              </Card>
            </Grid>
          <Box sx={{ display: "flex", alignItems: "center", mt:2}}>
            <Typography
              sx={{
                color: "white",
                fontWeight: 600,
                fontSize: 30,
                marginRight: 1,
              }}
            >
              SPECIFIC DATA
            </Typography>
            <Typography
              sx={{
                color: resourceColor || "white",
                fontWeight: 600,
                fontSize: 30,
                mr: 2,
                textTransform: "uppercase",
              }}
            >
              ({selectedResourceName}
            </Typography>
            <Typography
              sx={{
                color: resourceColor || "white",
                fontWeight: 600,
                fontSize: 30,
              }}
            >
              {selectedResourceVersion})
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 1 }}>
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
                    backgroundColor: selectedResourceType
                      ? "#393636"
                      : "#2e2e2e",
                    borderRadius: "5px",
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "whitesmoke" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  }}
                />
              )}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              options={resourceVersionOptions}
              value={selectedResourceVersion}
              onChange={(event, newValue) => {
                setResourceVersion(newValue);
              }}
              disabled={!selectedResourceName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Resource Version"
                  variant="outlined"
                  sx={{
                    backgroundColor: selectedResourceName
                      ? "#393636"
                      : "#2e2e2e",
                    borderRadius: "5px",
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "whitesmoke" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  }}
                />
              )}
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* Modular Data Cards */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  backgroundColor: "#2A2828",
                  color: "white",
                  padding: "20px",
                }}
              >
                <Typography variant="h6">Total Content</Typography>
                <Typography variant="h4">{totalPosts ?? "-"}</Typography>
              </Card>
            </Grid> */}

            {bugFixPieData.length > 0 && (
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    backgroundColor: "#2A2828",
                    color: "white",
                    padding: "20px",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Bug vs Fix Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={bugFixPieData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="#8884d8"
                        labelLine={false}
                      >
                        {bugFixPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "bugs" ? "#FF4C4C" : "#4CAF50"
                            }
                          />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#00FF99"
                        fontSize={18}
                        fontWeight="bold"
                      >
                        {(() => {
                          const total = bugFixPieData.reduce(
                            (sum, d) => sum + d.count,
                            0
                          );
                          const fixCount =
                            bugFixPieData.find((d) => d.name === "fixes")
                              ?.count || 0;
                          return total > 0
                            ? `${((fixCount / total) * 100).toFixed(1)}% Fix`
                            : "0% Fix";
                        })()}
                      </text>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value}`,
                          name === "bugs" ? "Bugs" : "Fixes",
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  backgroundColor: "#2A2828",
                  color: "white",
                  padding: "20px",
                  minHeight: "200px",
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Trending Tags
                </Typography>
                {popularTags.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {popularTags.map((tag, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "#393939",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#FFD700",
                              fontSize: "0.95rem",
                              mr: 1.5,
                            }}
                          >
                            #{index + 1}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.95rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {tag.resource_tag_name}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            backgroundColor: "#1E88E5",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          {tag.usage_count} post{tag.usage_count > 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="gray" sx={{ mt: 2 }}>
                    No data available.
                  </Typography>
                )}
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  backgroundColor: "#2A2828",
                  color: "white",
                  padding: "20px",
                  minHeight: "200px",
                  
                }}
              >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Average User Feedback
              </Typography>
                <Box sx={{ mt: 2 }}>
                  {["usefulness", "recommendation", "clarity"].map((key, i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontSize: "0.95rem", textTransform: "capitalize" }}>
                        {key}:{" "}
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: "bold",
                            color: "#00FFC2",
                          }}
                        >
                          {feedbackScores[key] ?? "-"} / 5
                        </Typography>
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#FFD700", mb: 1 }}>
                  Overall Average:{" "}
                  <Typography component="span" sx={{ fontWeight: "bold", color: "#00FFC2" }}>
                    {feedbackScores.overall ?? "-"} / 5
                  </Typography>
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  backgroundColor: "#2A2828",
                  color: "white",
                  padding: "20px",
                }}
              >
                <Typography variant="h6">Total Content</Typography>
                <Typography variant="h4">{totalPosts ?? "-"}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  backgroundColor: "#2A2828",
                  color: "white",
                  padding: "20px",
                }}
              >
                <Typography variant="h6">Total Followers</Typography>
                <Typography variant="h4">{followerCount ?? "-"}</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default AnalyticsPage;
