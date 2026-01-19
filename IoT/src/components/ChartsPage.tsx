import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts";
import { Box, Typography, Stack, Paper, Button } from "@mui/material";

interface DataType {
  temperature: number;
  brightness: number;
  humidity: number;
  roomId: number;
  readingDate: string;
}

interface LatestDataType {
  temperature: number;
  brightness: number;
  humidity: number;
  roomId: number;
  userId: string;
  readingDate: string;
}

const ChartsPage: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [latestDataList, setLatestDataList] = useState<LatestDataType[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [chartsData, setChartsData] = useState<DataType[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomIds = Array.from({ length: 22 }, (_, i) => i);

  // Pobierz latest data dla wszystkich pokojów
  useEffect(() => {
    const fetchLatest = async () => {
      setLoadingLatest(true);
      setError(null);
      try {
        const results: LatestDataType[] = [];
        for (const id of roomIds) {
          try {
            const res = await fetch(
              `http://localhost:3100/api/room/${id}/latest`,
              {
                headers: {
                  "x-access-token": localStorage.getItem("token") || "",
                },
              }
            );
            if (!res.ok) {
              if (res.status === 404) continue;
              throw new Error(`Błąd HTTP: ${res.status}`);
            }
            const json = await res.json();
            results.push(json);
          } catch (e: any) {
            console.warn(`Błąd pobierania pokoju ${id}: ${e.message}`);
          }
        }
        setLatestDataList(results);
        if (results.length > 0 && selectedRoomId === null) {
          setSelectedRoomId(results[0].roomId);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatest();
  }, []);

  // Pobierz dane dla wybranego pokoju
  useEffect(() => {
    if (selectedRoomId === null) {
      setChartsData([]);
      return;
    }

    const fetchChartData = async () => {
      setLoadingCharts(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:3100/api/room/${selectedRoomId}`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token") || "",
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error("Non-OK response for chart fetch:", res.status, text);
          throw new Error(`Server error ${res.status}: ${text}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Unexpected non-JSON response for chart fetch:", text);
          throw new Error(`Unexpected response from server: ${text}`);
        }

        const jsonData: DataType[] = await res.json();
        setChartsData(jsonData);
      } catch (err: any) {
        console.error("Charts: Error:", err);
        setError(err.message);
        setChartsData([]);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, [selectedRoomId]);

  const renderChart = () => {
    if (selectedRoomId === null) {
      return <Typography>Wybierz pokój, aby zobaczyć wykres</Typography>;
    }
    if (loadingCharts) {
      return <Typography>Ładowanie wykresu...</Typography>;
    }
    if (error) {
      return <Typography color="error">Błąd ładowania wykresu: {error}</Typography>;
    }
    if (chartsData.length === 0) {
      return <Typography>Brak danych do wykresu</Typography>;
    }

    const sortedData = [...chartsData].sort(
      (a, b) =>
        new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
    );

    const dates = sortedData.map((d) => new Date(d.readingDate));
    const temperatureData = sortedData.map((d) => d.temperature);
    const brightnessData = sortedData.map((d) => d.brightness);
    const humidityData = sortedData.map((d) => d.humidity);

    return (
      <LineChart
        width={900}
        height={400}
        series={[
          { data: brightnessData, label: "Brightness (%)", color: "#90ee90" },
          { data: humidityData, label: "Humidity (%)", color: "#87cefa" },
          {
            data: temperatureData,
            label: "Temperature (°C)",
            color: "#ff00ff",
          },
        ]}
        xAxis={[
          {
            data: dates,
            scaleType: "time",
            label: "Data odczytu",
            labelStyle: { fill: "#fff", fontWeight: "bold" },
            stroke: "#fff",
            tickLabelStyle: { fill: "#fff", fontSize: 10 },
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 100,
            label: "Wartość",
            labelStyle: { fill: "#fff", fontWeight: "bold" },
            tickLabelStyle: { fill: "#fff" },
            stroke: "#fff",
          },
        ]}
        sx={{ backgroundColor: "#000" }}
        slotProps={{
          legend: {
            labelStyle: { fill: "#fff" },
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Wykresy pokojów
      </Typography>

      {error && <Typography color="error">Błąd: {error}</Typography>}

      {/* Main chart area */}
      <Box
        sx={{
          backgroundColor: "#1e1e1e",
          padding: 3,
          borderRadius: 1,
          color: "white",
          marginBottom: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "450px",
        }}
      >
        {renderChart()}
      </Box>

      {/* Room selector at the bottom */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Wybierz pokój
        </Typography>

        {loadingLatest ? (
          <Typography>Ładowanie pokojów...</Typography>
        ) : latestDataList.length === 0 ? (
          <Typography color="text.secondary">Brak pokojów z danymi</Typography>
        ) : (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {latestDataList.map((roomData) => {
              const id = roomData.roomId;
              return (
                <Button
                  key={id}
                  onClick={() => setSelectedRoomId(id)}
                  sx={{
                    padding: 2,
                    paddingX: 3,
                    backgroundColor:
                      id === selectedRoomId ? "#2e7d32" : "#333333",
                    color: "white",
                    transition: "background-color 0.3s ease",
                    border:
                      id === selectedRoomId
                        ? "2px solid #66bb6a"
                        : "2px solid transparent",
                    "&:hover": {
                      backgroundColor:
                        id === selectedRoomId ? "#1b5e20" : "#444444",
                    },
                    textTransform: "none",
                    fontSize: "1rem",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      Pokój {id}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                      Temp: {roomData.temperature}°C | Wilg: {roomData.humidity}
                      %
                    </Typography>
                  </Stack>
                </Button>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ChartsPage;
