import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Not Authorized. Token missing." });
    }

    try {
        // ✅ Fix: Support both "Bearer <token>" and "<token>" formats
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        if (!token) {
            return res.status(401).json({ success: false, message: "Invalid token format." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log("JWT Error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid Token. Login again." });
    }
};

export default authMiddleware;
