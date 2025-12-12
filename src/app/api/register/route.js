import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { email, password, name } = await req.json();
        console.log("Register API Hit:", { email, name }); // Log input

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("Register: User already exists for email:", email);
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        console.log("Register: Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = email === "andreadelfoco5@gmail.com" ? "admin" : "user";
        console.log("Register: Creating user with role:", role);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
                isSubscribed: true, // Auto-subscribe to newsletter
            },
        });

        console.log("Register: User created successfully:", user.id);

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Register API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
