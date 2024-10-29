// backend/src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const client = new RecaptchaEnterpriseServiceClient();

// Reemplaza con tu project ID y site key
const projectId = 'unified-sensor-148719';
const siteKey = '6LcYy20qAAAAAIvvlzuQaEZtdneR6zdjJ8AOEnPX';

// Deshabilitar CORS
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());

app.post('/verify-recaptcha', async (req, res) => {
  const { token } = req.body;
const accountId='BP3ptt00D9W7UMzFmsPdEjNH3Chpi8bo40R6YW2b';
  try {
    const [response] = await client.createAssessment({
      parent: `projects/${projectId}`,
      assessment: {
        event: {
          token,
          siteKey,
          userInfo:{
            accountId:accountId
          }
        },
        accountVerification: {
          endpoints:[
            {
              emailAddress:'juniorjhonnymalpartida@hotmail.com'
            }
          ]
      },
      },
    });

    const { tokenProperties, riskAnalysis,accountVerification } = response;
    if (tokenProperties?.valid && riskAnalysis?.score && riskAnalysis.score >= 0.5) {
      res.status(200).json({ success: true, response });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error en la verificación' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
