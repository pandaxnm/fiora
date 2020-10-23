import Koa from 'koa'
import User from "./models/user";
import connectDB from './mongoose';
import Router from 'koa-router';
import koaBody from 'koa-body';
import bcrypt from "bcryptjs";
import {saltRounds} from "../utils/const";

const app = new Koa();
const router = new Router();

router.post('/findUser',
    async (ctx) => {
        const {username} = ctx.request.body
        const user = await User.findOne({username: username})
        ctx.body = {
            code: 200,
            data: user ?? ''
        };
    }
);


router.post('/register',
    async (ctx) => {
        const {username, password, avatar} = ctx.request.body
        const user = await User.findOne({username: username})
        if(user) {
            ctx.body = {
                code: 400,
                msg: 'User Exists',
                data: ''
            };
            return;
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);

        try {
            await User.create({
                username,
                salt,
                password: hash,
                avatar: avatar,
            });
        } catch (err) {
            ctx.body = {
                code: 200,
                msg: 'Ok',
                data: 'Register Failed'
            };
            return;
        }

        ctx.body = {
            code: 200,
            msg: 'Ok',
            data: ''
        };
    }
);


router.post('/updateUser',
    async (ctx) => {
        const {username, avatar} = ctx.request.body
        if(!username && !avatar) {
            ctx.body = {
                code: 400,
                msg: 'Params Error',
                data: ''
            };
            return;
        }

        const user = await User.findOne({username: 'admin'})
        if(!user) {
            ctx.body = {
                code: 400,
                msg: 'User Not Found',
                data: ''
            };
            return;
        }
        let params = {
            username: user.username,
            avatar: user.avatar
        }
        if(username) {
            params.username= username;
        }
        if(avatar) {
            params.avatar = avatar;
        }

        ctx.body = {
            code: 200,
            msg: 'Ok',
            data: ''
        };
    }
);

app.use(koaBody());
app.use(router.routes());

connectDB().then(async () => {
    app.listen(3000);
})
