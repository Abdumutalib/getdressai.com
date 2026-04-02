import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GetDressAI API is working 🚀");
});
app.post("/generate", async (req, res) => {
  try {
    const { image } = req.body;

    res.json({
      success: true,
      result: "AI processed image (demo)"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// TEST API
app.post("/generate", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    // Ҳозирча fake response (кейин AI қўшамиз)
    const result = {
      original: imageUrl,
      generated: imageUrl,
      message: "AI processing will be here"
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
