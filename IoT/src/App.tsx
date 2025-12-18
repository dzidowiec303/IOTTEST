import { useState, useEffect } from "react";
import CurrentState from "./components/CurrentState";
import Charts from "./components/Charts";
import ChartsMain from "./components/ChartsMain";
import { Typography, Box, Stack, Paper } from "@mui/material";

import UserInput from "./components/UserInput";
import UserDelete from "./components/UserDelete";

interface LatestDataType {
  temperature: number;
  brightness: number;
  humidity: number;
  roomId: number;
  userId: string;
  readingDate: string;
}

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [latestDataList, setLatestDataList] = useState<LatestDataType[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomIds = Array.from({ length: 17 }, (_, i) => i);

  const [roomAllData, setRoomAllData] = useState<LatestDataType[]>([]);
  const [loadingAllData, setLoadingAllData] = useState(false);

  const [roomsWarning, setRoomsWarning] = useState<Record<number, boolean>>(
    {}
  );

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function hasBigJump(data: LatestDataType[]): boolean {
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      const tempDiff =
        Math.abs(curr.temperature - prev.temperature) / (prev.temperature || 1);
      const brightnessDiff =
        Math.abs(curr.brightness - prev.brightness) / (prev.brightness || 1);
      const humidityDiff =
        Math.abs(curr.humidity - prev.humidity) / (prev.humidity || 1);

      if (tempDiff > 0.2 || brightnessDiff > 0.2 || humidityDiff > 0.2) {
        return true;
      }
    }
    return false;
  }

  function getMaxRelativeDifferences(data: LatestDataType[]) {
    let maxTempDiff = 0;
    let maxHumidityDiff = 0;
    let maxBrightnessDiff = 0;

    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      const tempDiff =
        Math.abs(curr.temperature - prev.temperature) / (prev.temperature || 1);
      const humidityDiff =
        Math.abs(curr.humidity - prev.humidity) / (prev.humidity || 1);
      const brightnessDiff =
        Math.abs(curr.brightness - prev.brightness) / (prev.brightness || 1);

      if (tempDiff > maxTempDiff) maxTempDiff = tempDiff;
      if (humidityDiff > maxHumidityDiff) maxHumidityDiff = humidityDiff;
      if (brightnessDiff > maxBrightnessDiff) maxBrightnessDiff = brightnessDiff;
    }

    return {
      temp: (maxTempDiff * 100).toFixed(1),
      humidity: (maxHumidityDiff * 100).toFixed(1),
      brightness: (maxBrightnessDiff * 100).toFixed(1),
    };
  }

  useEffect(() => {
    const warnings: Record<number, boolean> = {};

    for (const id of roomIds) {
      const roomData = roomAllData.filter((d) => d.roomId === id);

      if (roomData.length > 1 && hasBigJump(roomData)) {
        warnings[id] = true;
      } else {
        warnings[id] = false;
      }
    }

    setRoomsWarning(warnings);
  }, [latestDataList, roomAllData]);

  useEffect(() => {
    if (selectedRoomId === null) {
      setRoomAllData([]);
      return;
    }
    const fetchAllData = async () => {
      setLoadingAllData(true);
      try {
        const res = await fetch(
          `http://localhost:3100/api/room/${selectedRoomId}`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token") || "",
            },
          }
        );
        if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
        const json = await res.json();
        setRoomAllData(json);
      } catch (e: any) {
        console.error("Błąd pobierania wszystkich danych:", e.message);
        setRoomAllData([]);
      } finally {
        setLoadingAllData(false);
      }
    };

    fetchAllData();
  }, [selectedRoomId]);

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
        if (results.length > 0) {
          setSelectedRoomId(results[0].roomId);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatest();
  }, [refreshTrigger]);

  const selectedLatestData =
    latestDataList.find((d) => d.roomId === selectedRoomId) || null;

  const diffs =
    roomAllData.length > 1 ? getMaxRelativeDifferences(roomAllData) : null;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Aktualny stan pokojów
      </Typography>

      {loadingLatest && <Typography>Ładowanie danych...</Typography>}
      {error && <Typography color="error">Błąd: {error}</Typography>}

      <Stack direction="row" spacing={4}>
        <Box sx={{ flex: 1, maxHeight: "50vh", overflowY: "auto" }}>
          <Stack spacing={2}>
            {roomIds.map((id) => {
              const roomData = latestDataList.find((d) => d.roomId === id);
              return (
                <Paper
                  key={id}
                  onClick={() => setSelectedRoomId(id)}
                  sx={{
                    padding: 2,
                    cursor: "pointer",
                    backgroundColor: roomsWarning[id]
                      ? "#d32f2f"
                      : id === selectedRoomId
                      ? "#1976d2"
                      : "#333333",
                    color: "white",
                    transition: "background-color 0.3s ease",
                    boxShadow:
                      id === selectedRoomId
                        ? "0 0 8px 2px rgba(25, 118, 210, 0.7)"
                        : "none",
                    "&:hover": {
                      backgroundColor: roomsWarning[id]
                        ? "#b71c1c"
                        : id === selectedRoomId
                        ? "#1565c0"
                        : "#444444",
                    },
                  }}
                  elevation={id === selectedRoomId ? 8 : 1}
                >
                  <Typography variant="h6">Pokój {id}</Typography>
                  {roomData ? (
                    <Typography variant="body2">
                      Temp: {roomData.temperature} °C, Wilgotność:{" "}
                      {roomData.humidity}%
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Brak danych
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Box>
        <Box sx={{ flex: 2 }}>
          <Typography variant="h5" gutterBottom>
            Szczegóły pokoju{" "}
            {selectedRoomId !== null ? selectedRoomId : ""}
          </Typography>

          {selectedLatestData ? (
            <>
              <CurrentState data={selectedLatestData} />
              <Box mt={4} sx={{ display: "flex", gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    Wykres
                  </Typography>
                  <Charts roomId={selectedRoomId} />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    maxHeight: "400px",
                    overflowY: "auto",
                    backgroundColor: "#1e1e1e",
                    padding: 2,
                    borderRadius: 1,
                    color: "white",
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Wszystkie odczyty
                  </Typography>
                  {loadingAllData ? (
                    <Typography>Ładowanie danych...</Typography>
                  ) : roomAllData.length === 0 ? (
                    <Typography>Brak danych</Typography>
                  ) : (
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {roomAllData.map((d, idx) => (
                        <li key={idx}>
                          {new Date(d.readingDate).toLocaleString()}: Temp{" "}
                          {d.temperature}°C, Wilgotność {d.humidity}%, Jasność{" "}
                          {d.brightness}%
                        </li>
                      ))}

                      {diffs && (
                        <li
                          style={{
                            marginTop: "10px",
                            fontStyle: "italic",
                            color: "#90caf9",
                          }}
                        >
                          Największe różnice: Temp {diffs.temp}%, Wilgotność{" "}
                          {diffs.humidity}%, Jasność {diffs.brightness}%
                        </li>
                      )}
                    </ul>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <Typography>Wybierz pokój, aby zobaczyć dane</Typography>
          )}
        </Box>
      </Stack>

      <Box mt={4} display="flex" gap={4} justifyContent="space-between">
        <Box flex={1}>
          <UserDelete
            onDeleteSuccess={() => {
              alert("Dane usunięte pomyślnie!");
              setRefreshTrigger(t => t + 1);
            }}
          />
        </Box>
        <Box flex={1}>
          <ChartsMain />
        </Box>
        <Box flex={1}>
          <UserInput
            roomId={9}
            onSuccess={() => {
              alert("Dane dodane pomyślnie!");
              setRefreshTrigger(t => t + 1);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
