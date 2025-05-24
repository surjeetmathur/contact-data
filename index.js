require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

// Fix private key line breaks for Google JWT auth
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    privateKey, ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

app.post("/api/contact", async(req, res) => {
    const {
        name,
        email,
        phone,
        interests,

        location,
        businessType,
        contactMethod,

    } = req.body;

    try {
        const values = [
            [
                name,
                email,
                phone,
                interests,

                location,
                businessType,
                contactMethod,

                message,

                new Date().toLocaleString(),
            ],
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: "USER_ENTERED",
            resource: { values },
        });

        res.status(200).json({ success: true, message: "Data added to sheet." });
    } catch (error) {
        console.error("Error appending data to Google Sheet:", error);
        res.status(500).json({ error: "Failed to store data in Google Sheet." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});