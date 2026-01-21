import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  email: string;
  login: string;
  role: string;
  active: boolean;
  isAdmin: boolean;
}

interface DecodedToken {
  _id: string;
  email: string;
  isAdmin: boolean;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState({
    login: "",
    email: "",
    password: "",
    isAdmin: false,
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const token = localStorage.getItem("token") || "";

  const getCurrentUserId = (): string | null => {
    try {
      const decoded = jwtDecode(token) as DecodedToken;
      return decoded._id;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3100/api/user/all", {
          headers: {
            "x-access-token": token,
          },
        });

        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3100/api/user/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }

      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.message);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleCreateUserClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCancelCreate = () => {
    setCreateDialogOpen(false);
    setNewUserFormData({
      login: "",
      email: "",
      password: "",
      isAdmin: false,
    });
  };

  const handleCreateUserConfirm = async () => {
    // Validate form
    if (!newUserFormData.login || !newUserFormData.email || !newUserFormData.password) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    setCreatingUser(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3100/api/user/admin/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({
            login: newUserFormData.login,
            email: newUserFormData.email,
            password: newUserFormData.password,
            isAdmin: newUserFormData.isAdmin,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Błąd HTTP: ${response.status}`);
      }

      const newUser = await response.json();
      setUsers([...users, newUser.user]);
      setCreateDialogOpen(false);
      setNewUserFormData({
        login: "",
        email: "",
        password: "",
        isAdmin: false,
      });
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleNewUserFormChange = (field: string, value: any) => {
    setNewUserFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <Typography variant="h4">Admin Panel</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateUserClick}
        >
          Dodaj użytkownika
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ marginBottom: 2 }}>Błąd: {error}</Typography>}

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6" gutterBottom>
          Użytkownicy ({users.length})
        </Typography>

        {loadingUsers ? (
          <Typography>Ładowanie użytkowników...</Typography>
        ) : users.length === 0 ? (
          <Typography color="text.secondary">Brak użytkowników</Typography>
        ) : (
          <Stack spacing={2} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
            {users.map((user) => (
              <Paper
                key={user._id}
                sx={{
                  padding: 2,
                  backgroundColor: "#2e2e2e",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {user.login}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    {user.email}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: user.isAdmin ? "#f44336" : "#1976d2",
                        padding: "2px 8px",
                        borderRadius: 1,
                        color: "white",
                      }}
                    >
                      {user.isAdmin ? "ADMIN" : "USER"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: user.active ? "#4caf50" : "#f44336",
                        padding: "2px 8px",
                        borderRadius: 1,
                        color: "white",
                      }}
                    >
                      {user.active ? "AKTYWNY" : "NIEAKTYWNY"}
                    </Typography>
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(user)}
                  disabled={user._id === currentUserId}
                  sx={{
                    marginLeft: 2,
                    opacity: user._id === currentUserId ? 0.5 : 1,
                  }}
                >
                  Usuń
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: "#1e1e1e", color: "white" }}>
          Potwierdzenie usunięcia
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#1e1e1e", color: "white" }}>
          <DialogContentText sx={{ color: "#aaa" }}>
            Czy na pewno chcesz usunąć użytkownika <strong>{userToDelete?.login}</strong>?
            Ta akcja nie może być cofnięta.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1e1e1e", padding: 2 }}>
          <Button onClick={handleCancelDelete} sx={{ color: "#aaa" }}>
            Anuluj
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={createDialogOpen}
        onClose={handleCancelCreate}
        aria-labelledby="create-user-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="create-user-dialog-title" sx={{ backgroundColor: "#1e1e1e", color: "white" }}>
          Dodaj nowego użytkownika
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#1e1e1e", color: "white", paddingTop: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Login"
              fullWidth
              value={newUserFormData.login}
              onChange={(e) => handleNewUserFormChange("login", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#666" },
                },
                "& .MuiInputBase-input::placeholder": { color: "#aaa" },
              }}
              InputLabelProps={{ style: { color: "#aaa" } }}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={newUserFormData.email}
              onChange={(e) => handleNewUserFormChange("email", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#666" },
                },
                "& .MuiInputBase-input::placeholder": { color: "#aaa" },
              }}
              InputLabelProps={{ style: { color: "#aaa" } }}
            />
            <TextField
              label="Hasło"
              fullWidth
              type="password"
              value={newUserFormData.password}
              onChange={(e) => handleNewUserFormChange("password", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#666" },
                },
                "& .MuiInputBase-input::placeholder": { color: "#aaa" },
              }}
              InputLabelProps={{ style: { color: "#aaa" } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newUserFormData.isAdmin}
                  onChange={(e) => handleNewUserFormChange("isAdmin", e.target.checked)}
                />
              }
              label={
                <Typography sx={{ color: "white" }}>
                  {newUserFormData.isAdmin ? "Admin" : "Zwykły użytkownik"}
                </Typography>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1e1e1e", padding: 2 }}>
          <Button onClick={handleCancelCreate} sx={{ color: "#aaa" }}>
            Anuluj
          </Button>
          <Button
            onClick={handleCreateUserConfirm}
            variant="contained"
            color="primary"
            disabled={creatingUser}
          >
            {creatingUser ? <CircularProgress size={24} /> : "Dodaj"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;