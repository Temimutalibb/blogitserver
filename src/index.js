const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { sql } = require("@vercel/postgres");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

app.get("/", (req, res) => {
  res.send("welcome");
});

function generatePin() {
  return crypto.randomBytes(16).toString("hex");
}
function generateTag() {
  return Math.floor(10000 + Math.random() * 90000);
}

app.post("/feedback", async (req, res) => {
  const { title, content, username, link, category } = req.body;
  if (title && content) {
    console.log(content);
    const pin = await generatePin();
    const tag = await generateTag();
    try {
      const data = await sql`INSERT INTO blogit(
          title, content, tag, pin, username, link, category,earn)
          VALUES (${title},${content},${tag},${pin},${username},${link}, ${category}, 0.00) RETURNING *`;

      if (data.rows.length > 0) {
        const tag = data.rows[0].tag;
        const pin = data.rows[0].pin;
        res.status(200).json({ pin: pin, tag: tag });
      }
    } catch (error) {
      console.log("error connecting ", error);
      return {
        message: "Failed to save, try again",
      };
    }
  } else {
    res.status(400).json({ message: "input is required" });
  }
});

app.get("/data", async (req, res) => {
  try {
    const data = await sql`SELECT * FROM blogit ORDER BY created_at DESC`;
    res.status(200).json(data.rows);
    console.log(data.rows);
  } catch (error) {
    res.status(500).send("Error feching data");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`backened running on port ${PORT}`);
});
