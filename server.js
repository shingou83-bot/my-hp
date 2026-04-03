/* =============================================
   バックエンドプロキシサーバー
   - 環境変数 ANTHROPIC_API_KEY を読み込み
   - フロントエンドの /api/chat を受け取り Claude API へ中継
============================================= */
import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app  = express();
const PORT = process.env.PORT || 3000;

/* 静的ファイル（index.html 等）を配信 */
app.use(express.static('.'));
app.use(express.json());

/* Anthropic クライアント（APIキーは環境変数から自動読み込み） */
const anthropic = new Anthropic();

/* チャット API エンドポイント */
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  /* 入力バリデーション */
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages が不正です。' });
  }

  try {
    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 1024,
      system,
      messages,
    });

    res.json({ content: response.content[0].text });
  } catch (err) {
    console.error('Claude API エラー:', err.message);
    const status  = err.status || 500;
    const message = err.message || 'サーバーエラーが発生しました。';
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
