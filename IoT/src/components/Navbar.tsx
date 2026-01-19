import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import HomeIcon from "@mui/icons-material/Home";
import SecurityIcon from "@mui/icons-material/Security";

import { isExpired } from "react-jwt";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  _id: string;
  email: string;
  isAdmin: boolean;
}

const pages = ["Rooms", "Charts"];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [animeImage, setAnimeImage] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandomAnime = async () => {
      try {
        const response = await fetch("https://api.waifu.im/search");
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setAnimeImage(data.images[0].url);
        }
      } catch (error) {
        console.error("Error fetching anime image:", error);
      }
    };

    fetchRandomAnime();
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const token = localStorage.getItem("token");
  const loggedIn = token !== null && !isExpired(token);

  // Check if user is admin
  useEffect(() => {
    try {
      if (loggedIn && token) {
        const decoded = jwtDecode(token) as DecodedToken;
        setIsAdmin(decoded.isAdmin === true);
      } else {
        setIsAdmin(false);
      }
    } catch (e) {
      setIsAdmin(false);
    }
  }, [loggedIn, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Container maxWidth={false} sx={{ backgroundColor: "black" }}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <HomeIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            Smart Home
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => {
                    handleCloseNavMenu();
                    if (page === "Rooms") {
                      navigate("/dashboard");
                    } else if (page === "Charts") {
                      navigate("/charts");
                    }
                  }}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate("/admin");
                  }}
                >
                  <SecurityIcon sx={{ mr: 1 }} />
                  <Typography textAlign="center">Admin</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  if (page === "Rooms") {
                    navigate("/dashboard");
                  } else if (page === "Charts") {
                    navigate("/charts");
                  }
                }}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                  "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.3)" },
                  marginLeft: 1,
                }}
                startIcon={<SecurityIcon />}
              >
                Admin
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {loggedIn ? (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <></>
            )}
            {animeImage && (
              <img
                src={animeImage}
                alt="Random anime"
                style={{
                  height: "4vh",
                  width: "4vh",
                  borderRadius: 4,
                  objectFit: "cover",
                  marginLeft: 8,
                }}
              />
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
