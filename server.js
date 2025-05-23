const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
    // keyFile: "credentials.json", // must exist
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),

    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

app.post("/api/submit-form", async(req, res) => {
    try {
        const { fullName, email, phone, location, businessType, interests, contactMethod, message } = req.body;

        if (!fullName || !email || !phone || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: authClient });

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            resource: {
                values: [
                    [
                        fullName,
                        email,
                        phone,
                        location,
                        businessType,
                        (interests || []).join(", "),
                        contactMethod,
                        message,
                        new Date().toLocaleString()
                    ]
                ]
            }
        });

        res.status(200).json({ message: "Form submitted successfully" });
    } catch (error) {
        console.error("Google Sheets Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port", process.env.PORT || 5000);
});