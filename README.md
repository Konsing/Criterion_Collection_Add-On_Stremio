
# 🎬 Criterion Collection Stremio Add-on

A **Stremio add-on** that lists **Criterion Collection Films** with metadata, posters, and more. This add-on:
- ✅ **Scrapes movie data** directly from **Criterion's website** using **Selenium-Stealth**.
- ✅ **Serves the data via a Flask API**.
- ✅ **Integrates with Stremio Add-on SDK** to display movies **with posters** inside Stremio.

---

## **📌 Features**
- ✅ **Browse Criterion Collection movies** inside Stremio.
- ✅ **Movie Metadata** (Title, Poster).
- ✅ **Selenium-Stealth Scraper** to bypass bot protections.
- ✅ **Flask API** to serve movie data.
- ✅ **Stremio Add-on SDK Integration** for Stremio compatibility.
- ✅ **Deployment options** (Run locally or host on Render/Glitch).

---

## **🚀 Getting Started**
### **1️⃣ Install Dependencies**
Ensure you have Python and Node.js installed.

#### **Python Dependencies**
Run the following command to install the required Python dependencies:

pip install selenium webdriver-manager selenium-stealth flask flask-cors


#### **Node.js Dependencies**
Run the following command to install the required Node.js dependencies:

npm install stremio-addon-sdk


---

## **🕵️‍♂️ Step 1: Scrape Criterion Movie List**
This script **scrapes movie data** directly from the **Criterion website**.

### **🔹 Run the scraper**
Run the scraper to generate `criterion_movies.json`:

python scraper.py


---

## **🌐 Step 2: Run the Flask API**
Now, we serve the JSON data using **Flask** so that Stremio can fetch it.

### **🔹 Run the Flask API**

python flask_api.py

- This will start the API at `http://localhost:5000/`
- Visit `http://localhost:5000/criterion-movies` in your browser to see the data.

---

## **🎬 Step 3: Run the Stremio Add-on**
This script integrates the Flask API with **Stremio Add-on SDK**.

### **🔹 Run the Stremio Add-on**

node stremio_addon.js

- This will start the add-on at:
  
  http://localhost:7000/manifest.json
  
- Open this URL in your browser to confirm it’s working.

---

## **📡 Step 4: Add to Stremio**
1. Open **Stremio**.
2. Go to **Add-ons > Developer Mode > Add an Add-on**.
3. Enter:
   
   http://localhost:7000/manifest.json
   
4. Click **Install**, then check if movies appear inside Stremio!

---

## **🚀 Fix: If Movies Are Not Showing in Stremio**
If the add-on installs but **doesn’t show movies**, do the following:

### **✅ Fix 1: Ensure `stremio_addon.js` is Correct**
Make sure the `stremio_addon.js` script includes the `"type": "movie"` field in both the catalog and meta responses. Stremio requires this for proper functionality.

### **✅ Fix 2: Check the Catalog Endpoint**
Visit:

http://localhost:7000/catalog/movie/criterion.json

Make sure it returns a valid JSON response with movie data.

### **✅ Fix 3: Check the Meta Endpoint**
Visit:

http://localhost:7000/meta/movie/anora.json

Ensure the response includes the `"type": "movie"` field.

### **✅ Fix 4: Restart Stremio & Reinstall the Add-on**
1. **Remove the add-on** from Stremio.
2. **Reinstall it** with:
   
   http://localhost:7000/manifest.json
   
3. **Restart Stremio completely** and check if movies appear.

---

## **🔄 Hosting the Stremio Add-on**
### **🔥 Deploy the Flask API**
1. **Render.com** (Recommended)
   - Create an account at [Render.com](https://render.com).
   - Deploy your Flask API by connecting your GitHub repo.
   - Set the `Start Command` as:
     
     python flask_api.py
     
   - Your API will be live at:
     
     https://your-app-name.onrender.com/
     

### **📡 Deploying the Stremio Add-on**
1. **Glitch.com**
   - Upload your `stremio_addon.js` file.
   - Set the URL inside Stremio to your hosted Glitch project.

2. **VPS (DigitalOcean, Linode, etc.)**
   - Use **PM2** to keep the Stremio add-on running persistently.

---

## **🎯 Next Steps**
✅ **Test the add-on inside Stremio.**  
✅ **Deploy the API to Render/Glitch for public access.**  
✅ **Add IMDb IDs & streaming links (for future updates).**  

---

## **🚀 Need Help?**
If you need help with deployment or adding new features, feel free to ask! 🎬🚀
