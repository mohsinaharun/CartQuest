const User = require('../models/User');

module.exports = async function (req, res, next) {
    try {
        console.log('[DEBUG] Admin Middleware - User ID:', req.user?.id);
        const user = await User.findById(req.user.id);
        console.log('[DEBUG] Admin Middleware - Found User Rule:', user?.role);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
