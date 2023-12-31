import {User} from "../models/user.model.mjs";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import {CartService} from "./cart.service.mjs";
import {WishlistService} from "./wishlist.service.mjs";
import {Wishlist} from "../models/wishlist.model.mjs";

class AuthService {
    async create(user) {
        user = await User.create(user);
        const {password, ...userWithoutPassword} = user._doc;
        await this.#createCart(user._doc._id);
        await this.#createWishList(user._doc._id);
        return userWithoutPassword;
    }

    async login(user) {
        const db_user = await User.findOne({email: user.email})
        if (await bcrypt.compare(user.password, db_user.password)) {
            const {password, ...userWithoutPassword} = db_user._doc;
            return userWithoutPassword;
        } else {
            return false
        }
    }


    // Generate a JWT token for a given user
    generateToken(user) {
        const secretKey = process.env.TOKEN_SECRET_KEY; // Replace this with a strong secret key
        const expiresIn = process.env.EXPIRES_IN; // Token expiration time, you can adjust this as needed
        const payload = {user_id: user._id, email: user.email, type: user.type}; // Customize the payload as needed

        return jwt.sign(payload, process.env.TOKEN_SECRET_KEY, {expiresIn});
    }

    async #createCart(user_id) {
        const cartService = new CartService();
        await cartService.create(user_id);
    }

    async #createWishList(user_id) {
        const wishListService = new WishlistService();
        await Wishlist.create({user_id: user_id});
    }
}

export {AuthService};
