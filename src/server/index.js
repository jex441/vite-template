import express from "express";
import passport from "passport";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import "dotenv/config";
import SequelizeStore from "connect-session-sequelize";

import db from "../db/index.js";
import { User } from "../db/models/index.js";

import users from "./lib/users.js";

import { createServer } from "node:http";
import { Server } from "socket.io";

// Constants
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

const { env_vars } = process.env;

const sequelizeStore = SequelizeStore(session.Store);
const store = new sequelizeStore({ db });

const app = express();

const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);
	socket.on("action", () => {
		socket.emit("reaction");
	});
});

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: false,
		store,
	})
);

// body parsing middleware
app.use(express.json());
app.use("/", express.static(__dirname + "/dist"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

passport.serializeUser(function (user, cb) {
	process.nextTick(function () {
		cb(null, { id: user.id, username: user.username, avatar: user.avatar });
	});
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// passport.use(
// 	new GoogleStrategy(
// 		{
// 			clientID: GOOGLE_OAUTH_APP_CLIENT_ID,
// 			clientSecret: GOOGLE_OAUTH_APP_CLIENT_SECRET,
// 			callbackURL: GOOGLE_OAUTH_APP_CALLBACK_URL,
// 			scope: ["https://www.googleapis.com/auth/userinfo.email"],
// 		},
// 		async function (accessToken, refreshToken, profile, cb) {
// 			const email = profile.emails[0].value;
// 			const username = email.split("@")[0];
// 			const [user, created] = await User.findOrCreate({
// 				where: { email: email },
// 				defaults: {
// 					username: username,
// 					email: profile.emails[0].value,
// 					googleID: profile.id,
// 					avatar: profile.photos[0].value,
// 					verifiedThru: "google",
// 				},
// 			});
// 			if (created) {
// 				console.log("user id", user.id);
// 				await addToSandbox(user.id);
// 			}
// 			return cb(null, user);
// 		}
// 	)
// );

app.get("/api/test", function (req, res) {
	return res.send(200);
});

app.get("/api/auth/google", passport.authenticate("google"));

app.get(
	"/api/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/login",
		failureMessage: true,
	}),
	function (req, res) {
		res.redirect("/");
	}
);

app.get("/api/auth/logout", function (req, res) {
	req.logout(function (err) {
		req.session.destroy();
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

app.get("/api/auth/me", function (req, res) {
	if (!req.user) {
		return res.send({ isLoggedIn: false });
	}
	return res.send({ isLoggedIn: true, info: req.user });
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

app.use("/api/users", ensureAuthenticated, users);

app.use("*", (req, res) => {
	res.sendFile(path.join(__dirname, "/dist/index.html"));
});

// Connect to database
const syncDB = async () => {
	await db.sync();
	console.log("All models were synchronized successfully.");
};

const authenticateDB = async () => {
	try {
		await db.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

syncDB();
authenticateDB();

// Start http server
server.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`);
});
