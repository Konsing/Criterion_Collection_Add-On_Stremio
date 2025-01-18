# 📽️ Criterion Collection Stremio Add-on

A **Stremio add-on** that lists the **Top 100 Criterion Films** with metadata, posters, and streaming links. The add-on scrapes movie data, serves it via a **Flask API**, and integrates with **Stremio Add-on SDK** to display the films in Stremio.

---

## 📌 Features
- ✅ **Top 100 Criterion Films** listed inside Stremio.
- ✅ **Metadata Display** (Title, Poster, Letterboxd Link).
- ✅ **Simple Flask API** for serving movie data.
- ✅ **Stremio Add-on SDK Integration** for seamless Stremio support.
- ✅ **Free Hosting Options** (Can run locally or deploy on Render/Glitch).

---

## 📁 Project Structure
```
/criterion-stremio-addon
│── scraper.py             # Scrapes movie data from Letterboxd
│── criterion_movies.json  # Stores scraped movie data
│── flask_api.py           # Flask API to serve movie data
│── stremio_addon.py       # Stremio Add-on using the Stremio SDK
│── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
Make sure you have Python installed, then install the required packages:
```sh
pip install requests beautifulsoup4 flask stremio-addon-sdk
```

---

## 🕵️‍♂️ Step 1: Scrape Criterion Movie List
This script scrapes the **Top 100 Criterion Films** from a Letterboxd list.

### 🔹 **Run the scraper:**
```sh
python scraper.py
```
## 🌐 Step 2: Run the Flask API
Now, we serve the JSON data using **Flask** so that Stremio can fetch it.

### 🔹 **Run the Flask API:**
```sh
python flask_api.py
```

## 🎬 Step 3: Run the Stremio Add-on
This script integrates our Flask API with **Stremio Add-on SDK**.

### 🔹 **Run the Stremio Add-on:**
```sh
python stremio_addon.py
```

---

## 📡 Step 4: Add to Stremio
1. Open **Stremio**.
2. Go to **Add-ons > Developer Mode > Add an Add-on**.
3. Enter:
   ```
   http://localhost:7000/manifest.json
   ```
4. Click **Install** and start browsing the **Criterion Collection** inside Stremio!

---

## 🔄 Hosting Options
Right now, this runs **locally**. To host it for free:
- Use **Render.com** or **Glitch** to deploy the Flask API.
- Use **GitHub Pages** for hosting static JSON data.

---

## 🎯 Next Steps
✅ **Add Filtering by Genre, Director, or Year**  
✅ **Optimize for Faster API Response**  
✅ **Improve Metadata with More Details**  

---

## ⚡ Summary
| Step  | Action |
|-------|--------|
| 1️⃣   | Scrape **Top 100 Criterion Films** using BeautifulSoup |
| 2️⃣   | Serve the data using a **Flask API** |
| 3️⃣   | Build a **Stremio Add-on** with the Stremio SDK |
| 4️⃣   | Install and use the add-on inside **Stremio** |

---

### 🚀 Need Help?
If you need help setting up filters or deploying the add-on, feel free to ask! 🎬
