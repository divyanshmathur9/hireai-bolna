const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.json({ message: 'Bolna Screener backend is running!' });
});

// 1️⃣ Trigger a Bolna call
app.post('/api/trigger-call', async (req, res) => {
  try {
    const { name, phone, role } = req.body;

    const response = await axios.post('https://api.bolna.ai/call', {
      agent_id: process.env.BOLNA_AGENT_ID,
      recipient_phone_number: phone,
      user_data: { candidate_name: name, role }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.BOLNA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('==========================================');
    console.log('BOLNA RESPONSE:', JSON.stringify(response.data, null, 2));
    console.log('==========================================');

    const call_id =
      response.data.execution_id ||
      response.data.executionId ||
      response.data.call_id ||
      response.data.callId ||
      response.data.id ||
      null;

    console.log('Extracted call_id:', call_id);

    const { data, error } = await supabase
      .from('candidates')
      .insert([{ name, phone, role, call_id, status: 'called' }])
      .select();

    if (error) throw error;

    res.json({ success: true, candidate: data[0] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Bolna webhook
app.post('/api/webhook/bolna', async (req, res) => {
  try {
    console.log('==========================================');
    console.log('WEBHOOK RECEIVED:', JSON.stringify(req.body, null, 2));
    console.log('==========================================');

    const body = req.body;

    const call_id =
      body.execution_id ||
      body.executionId ||
      body.call_id ||
      body.callId ||
      body.id ||
      null;

    const transcript =
      body.transcript ||
      body.call_transcript ||
      body.conversation ||
      body.transcription ||
      body.call?.transcript ||
      body.data?.transcript ||
      '';

    console.log('Extracted call_id:', call_id);
    console.log('Extracted transcript:', transcript?.slice(0, 200));

    const positive = ['yes', 'available', 'interested', 'open', 'flexible', 'pune'];
    const text = transcript?.toLowerCase() || '';
    const score = Math.min(
      positive.filter(w => text.includes(w)).length * 20,
      100
    );

    if (call_id) {
      const { error } = await supabase
        .from('candidates')
        .update({ transcript, score, status: 'completed' })
        .eq('call_id', call_id);

      if (error) console.log('❌ Supabase error:', error);
      else console.log(`✅ Updated — call_id: ${call_id} Score: ${score}`);
    } else {
      console.log('⚠️ No call_id found — full body:', JSON.stringify(body, null, 2));
    }

    res.json({ received: true });
  } catch (err) {
    console.log('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Get all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});