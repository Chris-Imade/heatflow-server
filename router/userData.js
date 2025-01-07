import express from "express";
import userInfo from "../controller/userInfo.js";

const router = express.Router();

router.post('/submit', userInfo);

export default router;