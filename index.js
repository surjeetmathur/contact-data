const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function authorizeGoogle() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
    });
    return await auth.getClient();
}

app.post('/api/submit-form', async(req, res) => {
    try {
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

        const auth = await authorizeGoogle();
        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = '1bQmSdkMRbA2BMUUkcPyNpNPqnoWkvUUCHJOLw9MWPXA';

        const values = [
            [
                new Date().toLocaleString(),
                fullName,
                email,
                phone,
                location,
                businessType,
                interests.join(', '),
                contactMethod,
                message
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });

        res.status(200).json({ message: 'Form submitted successfully!' });

    } catch (err) {
        console.error("Error submitting form:", err);
        res.status(500).json({ error: 'Failed to submit form. Please try again later.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});