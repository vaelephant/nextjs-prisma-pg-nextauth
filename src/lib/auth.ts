// 导入所需的模块和库
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // 使用Prisma作为数据库适配器
import { NextAuthOptions } from "next-auth"; // NextAuth配置选项的类型
import CredentialsProvider from "next-auth/providers/credentials"; // 凭证提供者，用于用户名和密码登录
import db from "./db"; // 数据库实例
import { compare } from "bcrypt"; // 导入bcrypt库的compare函数，用于比较密码

// NextAuth的配置对象
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db), // 指定数据库适配器
    secret: process.env.NEXTAUTH_SECRET, // 加密JWT所用的密钥，应从环境变量中获取
    session: {
        strategy: 'jwt' // 使用JWT作为会话策略
    },
    pages: {
        signIn: '/sign-in', // 自定义登录页面的路径
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials', // 提供者名称
            credentials: {
                email: { label: "email", type: "email" }, // 邮箱字段配置
                password: { label: "Password", type: "password" }, // 密码字段配置
            },
            async authorize(credentials) {
                // 认证逻辑
                if (!credentials?.email || !credentials?.password) {
                    return null; // 如果没有提供邮箱或密码，则认证失败
                }

                // 查找数据库中的用户
                const existingUser = await db.user.findUnique({
                    where: { email: credentials?.email }
                });
                if (!existingUser) {
                    return null; // 如果找不到用户，则认证失败
                }

                // 比较提供的密码和数据库中的密码
                const passwordMatch = await compare(credentials.password, existingUser.password);
                if (!passwordMatch) {
                    return null; // 如果密码不匹配，则认证失败
                }

                // 认证成功，返回用户信息
                return {
                    id: `${existingUser.id}`,
                    username: existingUser.username,
                    email: existingUser.email,
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            // JWT回调，每次JWT更新时调用
            if (user) {
                // 如果在认证过程中有用户信息，则添加到JWT
                return {
                    ...token,
                    username: user.username
                }
            }
            return token; // 返回更新后的JWT
        },
        async session({ session, token, user }) {
            // 会话回调，每次会话访问时调用
            return{
                ...session,
                user:{
                    ...session.user,
                    username: token.username, // 将用户名添加到会话中，使其可在客户端访问
                }
            }
        },
    },
}
