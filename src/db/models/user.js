import { DataTypes } from "sequelize";
import db from "../index.js";

const User = db.define("User", {
	username: {
		type: DataTypes.STRING,
		unique: true,
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
	},
});

export default User;
