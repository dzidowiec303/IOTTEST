import React, { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";

interface UserDeleteProps {
  onDeleteSuccess?: () => void;
}

const UserDelete: React.FC<UserDeleteProps> = ({ onDeleteSuccess }) => {
  const [deleteDeviceId, setDeleteDeviceId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const handleDeleteInRange = async () => {
    if (!deleteDeviceId || !fromDate || !toDate) {
      setDeleteStatus("Wypełnij wszystkie pola");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3100/api/data/${deleteDeviceId}/range`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ fromDate, toDate }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setDeleteStatus(`Błąd: ${errorData.message || res.statusText}`);
      } else {
        setDeleteStatus("Pomyślnie usunięto dane");
        if (onDeleteSuccess) onDeleteSuccess();
      }
    } catch (error: any) {
      setDeleteStatus(`Błąd sieci: ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        backgroundColor: "#2e2e2e",
        padding: 3,
        borderRadius: 2,
        color: "white",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Usuń odczyty z urządzenia (przedział czasowy)
      </Typography>

      <Stack spacing={2}>
        <input
          type="number"
          placeholder="ID urządzenia"
          value={deleteDeviceId ?? ""}
          onChange={(e) => setDeleteDeviceId(Number(e.target.value))}
          min={0}
          max={16}
          style={{
            padding: "8px",
            borderRadius: 4,
            border: "none",
            width: "100%",
          }}
        />

        <label>
          Od daty:
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 4,
              border: "none",
              width: "100%",
            }}
          />
        </label>

        <label>
          Do daty:
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: 4,
              border: "none",
              width: "100%",
            }}
          />
        </label>

        <button
          onClick={handleDeleteInRange}
          style={{
            padding: "10px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Usuń odczyty
        </button>

        {deleteStatus && <Typography>{deleteStatus}</Typography>}
      </Stack>
    </Box>
  );
};

export default UserDelete;
