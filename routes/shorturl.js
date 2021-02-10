const express = require("express");
const shortid = require("shortid");
const validUrl = require("valid-url");
const config = require("config");
const Url = require("../mongomodel/url");

let shortUrlRoute = express.Router();

shortUrlRoute.post("/api/shorturl/new", async(req, res) => {
    const longUrl = req.body.longUrl;
    const baseUrl = config.get("baseUrl");
    if(!validUrl.isUri(baseUrl)) {
        return res.status(401).json({error: "Invalid URL"});
    }

    const urlCode = shortid.generate();

    if(!validUrl.isUri(longUrl)) {

        try {
            let url = await Url.findOne({longUrl : longUrl});
            if(url) {
                return res.status(200).json(url);
            } else {

                const shortUrl = baseUrl + "/api/shorturl/new" + urlCode;
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    clickCount: 0
                });

                await url.save()
                return res.status(201).json(url);
            }
        } catch(err) {
            console.error(err.message);
            return res.status(500).json("Internal Server error" + err.message);
        }
    } else {
        res.status(400).json("error: invalid url");
    }
});

module.exports = shortUrlRoute;