

export default async (req) => {
  const headers = {
    "Content-Type": "application/json"
  };

  const send = (data, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });

  if (req.method !== "POST") {
    return send({ error: "Method not allowed" }, 405);
  }

  try {
    const data = await req.json();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Telegram environment variables are missing");
    }

    if (
      !data.fullName ||
      !data.phone ||
      !data.city ||
      !data.cityRef ||
      !data.branch ||
      !data.branchRef
    ) {
      throw new Error("Заповніть усі поля доставки");
    }

    const quantity = Number(data.quantity);
    const total = Number(data.total);

    if (
      ![1, 2].includes(quantity) ||
      total !== quantity * 649
    ) {
      throw new Error("Некоректна кількість або сума замовлення");
    }

    const message = `
🛒 НОВЕ ЗАМОВЛЕННЯ

📦 Товар: Зарядний пристрій ZR-04 12/24 В, 6 А
🔢 Кількість: ${quantity} шт.
💰 Сума: ${total} грн

👤 ПІБ: ${data.fullName}
📞 Телефон: ${data.phone}

🏙 Місто: ${data.city}
🏤 Відділення: ${data.branch}
`;

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error("Telegram не прийняв повідомлення");
    }

    return send({ success: true });

  } catch (error) {
    return send({
      error: error.message || "Помилка сервера"
    }, 500);
  }
};
