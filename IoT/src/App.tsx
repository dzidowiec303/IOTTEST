import { useState, useEffect } from "react";
import CurrentState from "./components/CurrentState";
import { Typography, Box, Stack, Paper, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
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
  const roomIds = Array.from({ length: 22 }, (_, i) => i);

  const [roomAllData, setRoomAllData] = useState<LatestDataType[]>([]);
  const [loadingAllData, setLoadingAllData] = useState(false);

  const [roomsWarning, setRoomsWarning] = useState<Record<number, boolean>>(
    {}
  );

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddingNewRoom, setIsAddingNewRoom] = useState(false);
  const [newRoomId, setNewRoomId] = useState<number | "">("");

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
        Aktualny stan pokojów (max 22)
      </Typography>

      {loadingLatest && <Typography>Ładowanie danych...</Typography>}
      {error && <Typography color="error">Błąd: {error}</Typography>}

      <Stack direction="row" spacing={4}>
        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <Box sx={{ maxHeight: "50vh", overflowY: "auto" }}>
              <Stack spacing={2}>
                {loadingLatest ? (
                  <Typography>Ładowanie pokojów...</Typography>
                ) : latestDataList.length === 0 ? (
                  <Typography color="text.secondary">Brak pokojów z danymi</Typography>
                ) : (
                  latestDataList.map((roomData) => {
                    const id = roomData.roomId;
                    const handleDeleteRoom = async (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (window.confirm(`Czy na pewno chcesz usunąć pokój ${id} i wszystkie jego dane?`)) {
                        try {
                          const res = await fetch(
                            `http://localhost:3100/api/room/${id}/all`,
                            {
                              method: "DELETE",
                              headers: {
                                "x-access-token": localStorage.getItem("token") || "",
                              },
                            }
                          );
                          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                          if (selectedRoomId === id) {
                            setSelectedRoomId(null);
                          }
                          setRefreshTrigger(t => t + 1);
                        } catch (e: any) {
                          alert("Błąd podczas usuwania pokoju: " + e.message);
                        }
                      }
                    };

                    return (
                      <Paper
                        key={id}
                        sx={{
                          padding: 2,
                          backgroundColor: roomsWarning[id]
                            ? "#6a1b9a"
                            : id === selectedRoomId
                            ? "#2e7d32"
                            : "#333333",
                          color: "white",
                          transition: "background-color 0.3s ease",
                          boxShadow:
                            id === selectedRoomId
                              ? "0 0 8px 2px rgba(46, 125, 50, 0.7)"
                              : "none",
                          "&:hover": {
                            backgroundColor: roomsWarning[id]
                              ? "#4a148c"
                              : id === selectedRoomId
                              ? "#1b5e20"
                              : "#444444",
                          },
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                        elevation={id === selectedRoomId ? 8 : 1}
                      >
                        <Box 
                          onClick={() => setSelectedRoomId(id)}
                          sx={{ flex: 1, cursor: "pointer" }}
                        >
                          <Typography variant="h6">Pokój {id}</Typography>
                          <Typography variant="body2">
                            Temp: {roomData.temperature} °C, Wilgotność:{" "}
                            {roomData.humidity}%
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={handleDeleteRoom}
                          sx={{ color: "rgba(255, 255, 255, 0.7)", "&:hover": { color: "white" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    );
                  })
                )}
                {isAddingNewRoom ? (
                  <Paper
                    sx={{
                      padding: 2,
                      backgroundColor: "#333333",
                      color: "white",
                    }}
                    elevation={1}
                  >
                    <Typography variant="h6" gutterBottom>
                      Wybierz numer pokoju
                    </Typography>
                    <input
                      type="number"
                      placeholder="Numer pokoju (0-21)"
                      value={newRoomId === "" ? "" : newRoomId}
                      onChange={(e) => setNewRoomId(e.target.value === "" ? "" : Number(e.target.value))}
                      min={0}
                      max={21}
                      style={{
                        padding: "8px",
                        borderRadius: 4,
                        border: "none",
                        width: "100%",
                        backgroundColor: "#444",
                        color: "white",
                        marginBottom: "8px",
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <button
                        onClick={() => {
                          if (newRoomId !== "") {
                            setSelectedRoomId(Number(newRoomId));
                            setIsAddingNewRoom(false);
                            setNewRoomId("");
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#1976d2",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          flex: 1,
                        }}
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingNewRoom(false);
                          setNewRoomId("");
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#666",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          flex: 1,
                        }}
                      >
                        Anuluj
                      </button>
                    </Stack>
                  </Paper>
                ) : (
                  <Paper
                    onClick={() => setIsAddingNewRoom(true)}
                    sx={{
                      padding: 2,
                      cursor: "pointer",
                      backgroundColor: "#444444",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#555555",
                      },
                    }}
                    elevation={1}
                  >
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography>Dodaj pokój</Typography>
                  </Paper>
                )}
              </Stack>
            </Box>

            {selectedRoomId !== null && (
              <>
                {selectedLatestData && (
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      Szczegóły pokoju {selectedRoomId}
                    </Typography>
                    <CurrentState data={selectedLatestData} />
                  </Box>
                )}

                <UserInput
                  roomId={selectedRoomId}
                  onSuccess={() => {
                    alert("Dane dodane pomyślnie!");
                    setRefreshTrigger(t => t + 1);
                  }}
                />
              </>
            )}
          </Stack>
        </Box>

        <Box sx={{ flex: 1, maxHeight: "70vh", overflowY: "auto" }}>
          <Box
            sx={{
              backgroundColor: "#1e1e1e",
              padding: 2,
              borderRadius: 1,
              color: "white",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Wszystkie odczyty
            </Typography>
            {!selectedLatestData ? (
              <Typography>Wybierz pokój, aby zobaczyć dane</Typography>
            ) : loadingAllData ? (
              <Typography>Ładowanie danych...</Typography>
            ) : roomAllData.length === 0 ? (
              <Typography>Brak danych</Typography>
            ) : (
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {roomAllData.map((d, idx) => (
                  <li key={idx}>
                    {new Date(d.readingDate).toLocaleString()} | User: {typeof d.userId === 'object' && d.userId ? (d.userId as any).name : d.userId} | Temp{" "}
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
      </Stack>

      <Box mt={4}>
        <UserDelete
          onDeleteSuccess={() => {
            alert("Dane usunięte pomyślnie!");
            setRefreshTrigger(t => t + 1);
          }}
        />
      </Box>
    </Box>
  );
}

export default App;
