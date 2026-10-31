# Mini DC UPS — Netlify + Telegram

## Що всередині
- `index.html` — сторінка товару й форма замовлення.
- `netlify/functions/order.mjs` — серверна функція, яка надсилає замовлення в Telegram.
- `netlify.toml` — налаштування Netlify.

## Публікація
1. Створи безкоштовний акаунт на https://app.netlify.com/
2. Відкрий https://app.netlify.com/drop
3. Розпакуй ZIP і перетягни папку `minidc-ups-netlify` на сторінку Netlify Drop.
4. Після публікації відкрий сайт у Netlify та перейди в Project configuration → Environment variables.
5. Додай дві змінні:
   - `TELEGRAM_BOT_TOKEN` — токен від BotFather
   - `TELEGRAM_CHAT_ID` — твій Telegram chat ID
6. Зроби новий deploy (Deploys → Trigger deploy → Deploy site).

## Налаштування Telegram
1. У Telegram відкрий `@BotFather`, створи бота командою `/newbot` і скопіюй токен.
2. Відкрий свого нового бота за посиланням, яке надасть BotFather, та натисни Start / надішли `/start`.
3. Щоб дізнатися chat ID, відкрий у браузері (підставивши свій токен локально, не надсилай його нікому):
   `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates`
4. У відповіді знайди `message` → `chat` → `id`. Це і є `TELEGRAM_CHAT_ID`.
5. Внеси обидва значення в Netlify Environment variables. Не вставляй токен у HTML і не публікуй його.

## Перевірка
Після нового deploy зроби тестове замовлення на сайті. Заявка має прийти в Telegram.
Не публікуй токен бота в чатах, скриншотах або відкритому коді. Якщо токен випадково розкрився — відклич його через BotFather і створи новий.
