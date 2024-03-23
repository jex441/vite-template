import express from "express";

import { User } from "../../db/models/index.js";

import "dotenv/config";
const { env_vars } = process.env;

const router = express.Router();
//endpoint: /users

//get all users
router.get("/", async (_req, res) => {
	res.status(200).json({ message: "Hello World!" });
});

// find a user by a username
router.get("/:username", async (_req, res) => {
	const username = _req.params.username;
	try {
		const userData = await User.findOne({
			where: { username: username },
		});
		const userJSON = JSON.stringify(userData);
		const user = JSON.parse(userJSON, null, 2);
		if (user?.id) {
			return res.send({ status: 200, user: user });
		} else {
			return res.send({ status: 404, user: "not found" });
		}
	} catch (error) {
		return res.send({ status: 500, message: error.message });
	}
});

router.post("/:id", async (_req, res) => {});

// update user, profile etc
router.put("/:id", async (_req, res) => {
	res.status(200).json({ message: "Hello World!" });
});

router.delete("/:id", async (_req, res) => {
	try {
		const user = await User.delete({ where: { id: _req.params.id } });
		return { status: 200, message: "User deleted successfully." };
	} catch (error) {
		return { status: 500, message: error.message };
	}
});
export default router;
