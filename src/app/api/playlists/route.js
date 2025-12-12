import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET /api/playlists - Get user's playlists
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const playlists = await prisma.playlist.findMany({
            where: { userId: session.user.id },
            include: {
                beats: {
                    include: {
                        beat: true
                    },
                    orderBy: { order: 'asc' }
                },
                _count: {
                    select: { beats: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(playlists);

    } catch (error) {
        console.error("Get playlists error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/playlists - Create new playlist
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, isPublic } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: "Playlist name required" }, { status: 400 });
        }

        const playlist = await prisma.playlist.create({
            data: {
                userId: session.user.id,
                name: name.trim(),
                description: description?.trim() || null,
                isPublic: !!isPublic
            }
        });

        return NextResponse.json(playlist);

    } catch (error) {
        console.error("Create playlist error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/playlists?playlistId=xxx - Update playlist
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const playlistId = searchParams.get('playlistId');
        const { name, description, isPublic } = await req.json();

        if (!playlistId) {
            return NextResponse.json({ error: "playlistId required" }, { status: 400 });
        }

        // Check ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
        }

        if (playlist.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.playlist.update({
            where: { id: playlistId },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(isPublic !== undefined && { isPublic: !!isPublic })
            }
        });

        return NextResponse.json(updated);

    } catch (error) {
        console.error("Update playlist error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/playlists?playlistId=xxx - Delete playlist
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const playlistId = searchParams.get('playlistId');

        if (!playlistId) {
            return NextResponse.json({ error: "playlistId required" }, { status: 400 });
        }

        // Check ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
        }

        if (playlist.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.playlist.delete({
            where: { id: playlistId }
        });

        return NextResponse.json({ message: "Playlist deleted" });

    } catch (error) {
        console.error("Delete playlist error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
