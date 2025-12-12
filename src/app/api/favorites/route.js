import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// POST /api/favorites - Add to favorites
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { beatId } = await req.json();

        if (!beatId) {
            return NextResponse.json({ error: "beatId required" }, { status: 400 });
        }

        // Check if beat exists
        const beat = await prisma.beat.findUnique({
            where: { id: beatId }
        });

        if (!beat) {
            return NextResponse.json({ error: "Beat not found" }, { status: 404 });
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_beatId: {
                    userId: session.user.id,
                    beatId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Already favorited" }, { status: 400 });
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: session.user.id,
                beatId
            }
        });

        // Update analytics count
        await prisma.beatAnalytics.upsert({
            where: { beatId },
            create: {
                beatId,
                favorites: 1
            },
            update: {
                favorites: { increment: 1 }
            }
        });

        return NextResponse.json(favorite);

    } catch (error) {
        console.error("Add favorite error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { beatId } = await req.json();

        if (!beatId) {
            return NextResponse.json({ error: "beatId required" }, { status: 400 });
        }

        await prisma.favorite.delete({
            where: {
                userId_beatId: {
                    userId: session.user.id,
                    beatId
                }
            }
        });

        // Update analytics count
        await prisma.beatAnalytics.update({
            where: { beatId },
            data: {
                favorites: { decrement: 1 }
            }
        }).catch(() => { }); // Ignore if analytics doesn't exist

        return NextResponse.json({ message: "Removed from favorites" });

    } catch (error) {
        console.error("Remove favorite error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/favorites - Get user's favorites
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: session.user.id },
            include: {
                beat: {
                    include: {
                        licenses: {
                            include: {
                                license: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(favorites);

    } catch (error) {
        console.error("Get favorites error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
