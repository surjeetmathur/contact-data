const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Auth
const auth = new google.auth.GoogleAuth({
    keyFile: 'google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Route
app.post('/api/contact', async(req, res) => {
    const {
        fullName,
        email,
        phone,
        location,
        businessType,
        interests,
        contactMethod,
        message
    } = req.body;

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        await sheets.spreadsheets.values.append({
            spreadsheetId: '1bQmSdkMRbA2BMUUkcPyNpNPqnoWkvUUCHJOLw9MWPXA',
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [

                        fullName,
                        email,
                        phone,
                        location,
                        businessType,
                        interests.join(', '),
                        contactMethod,
                        message,
                        new Date().toLocaleString()
                    ]
                ]
            }
        });

        res.status(200).json({ message: "Form submitted successfully!" });
    } catch (err) {
        console.error("Google Sheets Error:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});