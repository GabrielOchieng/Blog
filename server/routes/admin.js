const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayOut = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

// CHECK LOGIN
const authMiddleWare = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, jwtSecret);
		req.userId = decoded.userId;
		next();
	} catch (err) {
		res.status(401).json({ message: "Unauthorized" });
	}
};

// GET ADMIN LOGIN PAGE

router.get("/admin", async (req, res) => {
	try {
		const locals = {
			title: "Admin",
			description: "Simple blog created with NodeJS, Express and MongoDb.",
		};

		res.render("admin/index", {
			locals,
			layout: adminLayOut,
		});
	} catch (err) {
		console.log(err);
	}
});

// POST
// Admin- Check Login

router.post("/admin", async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ userId: user._id }, jwtSecret);
		res.cookie("token", token, { httpOnly: true });

		res.redirect("/dashboard");
	} catch (err) {
		console.log(err);
	}
});

// Get admin dashboard
router.get("/dashboard", authMiddleWare, async (req, res) => {
	try {
		const locals = {
			title: "Dashboard",
			description: "Simple blog created with Nodejs, Express and MongoDB",
		};

		const data = await Post.find();
		res.render("admin/dashboard", { locals, data, layout: adminLayout });
	} catch (error) {}

	res.render("admin/dashboard");
});

// POST
// Admin- Register

router.post("/register", async (req, res) => {
	try {
		const { username, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			const user = await User.create({ username, password: hashedPassword });
			res.status(201).json({ message: "User created successfully", user });
		} catch (err) {
			if (err.code === 11000) {
				res.status(409).json({ message: "User already in use" });
			}
			res.status(500).json({ message: "Internal Server error" });
		}
	} catch (err) {
		console.log(err);
	}
});

// router.get("/post/:id", async (req, res) => {
// 	try {
// 		let slug = req.params.id;
// 		const data = await Post.findById({ _id: slug });

// 		const locals = {
// 			title: data.title,
// 			description: "Simple blog created with NodeJS, Express and MongoDb.",
// 		};

// 		res.render("post", {
// 			locals,
// 			data,
// 		});
// 	} catch (err) {
// 		console.log(err);
// 	}

// });

// router.post("/admin", async (req, res) => {
// 	try {
// 		const { username, password } = req.body;

// 		if (req.body.username === "admin" && req.body.password === "password") {
// 			res.send("You're logged in");
// 		} else {
// 			res.send("Wrong username or password");
// 		}
// 	} catch (err) {
// 		console.log(err);
// 	}
// });

module.exports = router;
