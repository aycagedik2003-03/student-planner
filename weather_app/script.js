const apiKeyWeather = "0cb2e2eda0a3463bbf9132303262904";

async function getWeather() {
  const city = document.getElementById("cityInput").value;

  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKeyWeather}&q=${city}&days=2`
  );

  const data = await res.json();
  console.log("DATA:", data);

  if (!data.location) {
    console.log("Hata:", data);
    return;
  }

  // 🔹 CURRENT
  document.getElementById("city").innerText = data.location.name;
  document.getElementById("temp").innerText =
    Math.round(data.current.temp_c) + "°C";

  // 🔥 CURRENT ICON (GECE/GÜNDÜZ)
  const currentCondition = data.current.condition.text;
  const currentIsDay = data.current.is_day;

  let currentIcon = "sun.png";

  if (currentCondition.includes("Clear")) {
    currentIcon = currentIsDay ? "sun.png" : "clearnight.png";
  } else if (currentCondition.includes("Cloud")) {
    currentIcon = currentIsDay ? "cloud.png" : "cloudynight.png";
  } else if (currentCondition.includes("Rain")) {
    currentIcon = currentIsDay ? "rainy.png" : "rainynight.png";
  } else if (currentCondition.includes("Snow")) {
    currentIcon = currentIsDay ? "snowy.png" : "snowynight.png";
  } else if (currentCondition.includes("Thunder")) {
    currentIcon = currentIsDay ? "storm.png" : "thundernight.png";
  } else {
    currentIcon = currentIsDay ? "partly.png" : "partlynight.png";
  }

  document.getElementById("icon").src = currentIcon;

  // 🌙 BODY MODE
  if (!currentIsDay) {
    document.body.classList.add("night");
  } else {
    document.body.classList.remove("night");
  }

  // 🔥 HOURLY (DOĞRU SIRALI)
  const todayHours = data.forecast.forecastday[0].hour;
  const tomorrowHours = data.forecast.forecastday[1].hour;

  let allHours = [...todayHours, ...tomorrowHours];

  // 🔥 KRİTİK: ZAMANA GÖRE SIRALA
  allHours.sort((a, b) => new Date(a.time) - new Date(b.time));

  const hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";

  const now = new Date();

  let count = 0;

  allHours.forEach(item => {
    const itemTime = new Date(item.time);

    // 🔥 geçmiş saatleri sil (DOĞRU FIX)
    if (itemTime < now) return;

    if (count >= 24) return;

    const date = new Date(item.time);

    // 🔥 NOW
    let time;
    if (count === 0) {
      time = "Now";
    } else {
      time = date.getHours().toString().padStart(2, "0") + ":00";
    }

    const temp = Math.round(item.temp_c);

    // 🔥 ICON
    const condition = item.condition.text;
    const isDay = item.is_day;

    let icon = "sun.png";

    if (condition.includes("Clear")) {
      icon = isDay ? "sun.png" : "clearnight.png";
    } else if (condition.includes("Cloud")) {
      icon = isDay ? "cloud.png" : "cloudynight.png";
    } else if (condition.includes("Rain")) {
      icon = isDay ? "rainy.png" : "rainynight.png";
    } else if (condition.includes("Snow")) {
      icon = isDay ? "snowy.png" : "snowynight.png";
    } else if (condition.includes("Thunder")) {
      icon = isDay ? "storm.png" : "thundernight.png";
    } else {
      icon = isDay ? "partly.png" : "partlynight.png";
    }

    const div = document.createElement("div");
    div.className = "hour-card";

    if (count === 0) {
      div.classList.add("now-card");
    }

    div.innerHTML = `
      <p>${time}</p>
      <img src="${icon}" width="40">
      <p>${temp}°</p>
    `;

    hourlyDiv.appendChild(div);

    count++;
  });
}