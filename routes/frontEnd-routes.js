const express = require('express');

const router = express.Router();

const frontEndController = require('../controllers/frontEnd-controller');


// Routes
router.post("/postSearchValue", frontEndController.postSearchValue);

router.post("/searchSuggestions", frontEndController.postSearchSuggestions);

router.post("/play", frontEndController.playSong);

router.post("/likeSong", frontEndController.likeSong);





module.exports = router;