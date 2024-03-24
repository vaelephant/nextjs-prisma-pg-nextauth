import db from '../../../lib/db';
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import * as z from "zod";

//define a schema for input fields validation

const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(3, 'Password must have than 3 characters'),
    // confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  

export async function POST(req: Request, res: NextResponse) {
    try {
        const body = await req.json();
         const { email, username, password } = userSchema.parse(body) ;

        //const { email, username, password } = body ;

        // Check    if the email already exists
        const existingUserByEmail = await db.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUserByEmail) {
            return NextResponse.json(
                {
                    user: null,
                    message: "Email already exists"
                },
                { status: 409 }

            )
        }


        // Check    if the username already exists
        const existingUserByUsername = await db.user.findUnique({
            where: {
                username: username
            }
        });
        if (existingUserByUsername) {
            return NextResponse.json(
                {
                    user: null,
                    message: "username already exists"
                },
                { status: 409 }

            )
        }
            const hashedPassword = await hash(password, 10);
            const newUser = await db.user.create(
                {
                    data: {
                        username,
                        email,
                        password: hashedPassword
                    }
                });
                const { password:newUserPassword, ...rest } = newUser;

            return NextResponse.json({ user: rest, message: "User created successfully" }, { status: 201 });

      } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


