import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import DownloadPage from "./components/DownloadPage";
import Title from "./components/Title";
import { extractIDFromUrl } from "./utils";

export default function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Title />
      </Box>

      <Box sx={{ my: 4 }}>
        <DownloadPage prefill={extractIDFromUrl(window.location.href)} />
      </Box>
    </Container>
  );
}
